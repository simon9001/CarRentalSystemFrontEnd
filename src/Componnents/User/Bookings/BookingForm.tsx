// src/components/booking/BookingForm.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Car, Calculator, AlertCircle } from 'lucide-react';
import { BookingApi } from '../../../features/Api/BookingApi';
import { BranchApi } from '../../../features/Api/BranchApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import Swal from 'sweetalert2';

interface BookingFormProps {
  vehicle: any;
  onBookingSuccess: (bookingData: any, paymentData: any) => void;
  onCancel: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  vehicle,
  onBookingSuccess,
  onCancel
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    pickup_date: '',
    return_date: '',
    pickup_branch_id: '',
    return_branch_id: '',
    notes: ''
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [rentalDays, setRentalDays] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);

  // RTK Queries and Mutations
  const { data: branches } = BranchApi.useGetActiveBranchesQuery();
  const [checkAvailability] = BookingApi.useCheckVehicleAvailabilityQuery();
  const [initiateBooking] = BookingApi.useInitiateBookingWithPaymentMutation();

  // Calculate rental details when dates change
  useEffect(() => {
    if (formData.pickup_date && formData.return_date) {
      calculateRentalDetails();
      checkVehicleAvailability();
    }
  }, [formData.pickup_date, formData.return_date]);

  const calculateRentalDetails = () => {
    const pickupDate = new Date(formData.pickup_date);
    const returnDate = new Date(formData.return_date);
    const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      setRentalDays(days);
      const dailyRate = vehicle.actual_daily_rate || vehicle.standard_daily_rate;
      setCalculatedTotal(days * dailyRate);
    } else {
      setRentalDays(0);
      setCalculatedTotal(0);
    }
  };

  const checkVehicleAvailability = async () => {
    if (formData.pickup_date && formData.return_date) {
      try {
        const availability = await checkAvailability({
          vehicleId: vehicle.vehicle_id,
          pickupDate: formData.pickup_date,
          returnDate: formData.return_date
        }).unwrap();
        setIsAvailable(availability);
      } catch (error) {
        console.error('Error checking availability:', error);
        setIsAvailable(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.pickup_date || !formData.return_date) {
      Swal.fire('Error', 'Please select both pickup and return dates', 'error');
      return false;
    }

    if (!formData.pickup_branch_id || !formData.return_branch_id) {
      Swal.fire('Error', 'Please select both pickup and return branches', 'error');
      return false;
    }

    const pickupDate = new Date(formData.pickup_date);
    const returnDate = new Date(formData.return_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDate < today) {
      Swal.fire('Error', 'Pickup date must be in the future', 'error');
      return false;
    }

    if (returnDate <= pickupDate) {
      Swal.fire('Error', 'Return date must be after pickup date', 'error');
      return false;
    }

    if (!isAvailable) {
      Swal.fire('Not Available', 'This vehicle is not available for the selected dates. Please choose different dates.', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsCalculating(true);

    try {
      const bookingRequest = {
        customer_id: user!.user_id,
        vehicle_id: vehicle.vehicle_id,
        model_id: vehicle.model_id,
        pickup_date: formData.pickup_date,
        return_date: formData.return_date,
        pickup_branch_id: parseInt(formData.pickup_branch_id),
        return_branch_id: parseInt(formData.return_branch_id),
        rate_per_day: vehicle.actual_daily_rate || vehicle.standard_daily_rate,
        notes: formData.notes,
        payment_method: 'paystack'
      };

      const result = await initiateBooking(bookingRequest).unwrap();
      
      Swal.fire('Success', 'Booking created successfully! Proceeding to payment...', 'success');
      onBookingSuccess(result.data.booking, result.data.payment);
    } catch (error: any) {
      console.error('Booking creation failed:', error);
      Swal.fire('Error', error.message || 'Failed to create booking. Please try again.', 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  const getMinReturnDate = () => {
    if (!formData.pickup_date) return '';
    const minDate = new Date(formData.pickup_date);
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Book Your Vehicle</h1>
              <p className="text-blue-100">Complete your booking details</p>
            </div>
            <Car size={32} className="text-blue-200" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicle Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Details</h3>
              <div className="flex items-start space-x-4">
                <img
                  src={vehicle.images?.[0]?.image_url || '/default-car.jpg'}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{vehicle.make} {vehicle.model} ({vehicle.year})</h4>
                  <p className="text-sm text-gray-600">Registration: {vehicle.registration_number}</p>
                  <p className="text-sm text-gray-600">Color: {vehicle.color}</p>
                  <p className="text-sm text-gray-600">Type: {vehicle.vehicle_type}</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    KES {(vehicle.actual_daily_rate || vehicle.standard_daily_rate).toLocaleString()}/day
                  </p>
                </div>
              </div>
            </div>

            {/* Rental Details */}
            <div className="space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Pick-up Date
                  </label>
                  <input
                    type="date"
                    name="pickup_date"
                    value={formData.pickup_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Return Date
                  </label>
                  <input
                    type="date"
                    name="return_date"
                    value={formData.return_date}
                    onChange={handleInputChange}
                    min={getMinReturnDate()}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Branches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Pick-up Branch
                  </label>
                  <select
                    name="pickup_branch_id"
                    value={formData.pickup_branch_id}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select branch</option>
                    {branches?.map(branch => (
                      <option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}, {branch.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Return Branch
                  </label>
                  <select
                    name="return_branch_id"
                    value={formData.return_branch_id}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select branch</option>
                    {branches?.map(branch => (
                      <option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}, {branch.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requests or requirements..."
                />
              </div>
            </div>
          </div>

          {/* Rental Calculation */}
          {(formData.pickup_date && formData.return_date) && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator size={20} className="mr-2" />
                Rental Calculation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-600">Rental Days</div>
                  <div className="text-xl font-bold text-blue-600">{rentalDays}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Daily Rate</div>
                  <div className="text-xl font-bold text-blue-600">
                    KES {(vehicle.actual_daily_rate || vehicle.standard_daily_rate).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Total Amount</div>
                  <div className="text-2xl font-bold text-green-600">
                    KES {calculatedTotal.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {!isAvailable && (
                <div className="mt-3 flex items-center text-red-600 bg-red-50 p-3 rounded border border-red-200">
                  <AlertCircle size={20} className="mr-2" />
                  <span>This vehicle is not available for the selected dates. Please choose different dates.</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCalculating || !isAvailable || rentalDays === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isCalculating || !isAvailable || rentalDays === 0
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Booking...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Clock size={20} />
                  <span>Proceed to Payment</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};