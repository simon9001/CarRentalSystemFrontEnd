// src/components/admin/bookings/CreateBookingForm.tsx
import React, { useState, useEffect } from 'react';
import { BookingApi } from '../../../features/Api/BookingApi';
import { type CreateBookingRequest } from '../../../types/booking';
import { User, Car, Calendar, MapPin, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface CreateBookingFormProps {
  onSuccess: () => void;
}

// Mock data - replace with actual API calls
const mockCustomers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892' }
];

const mockVehicles = [
  { id: 1, make: 'Toyota', model: 'Camry', year: 2023, registration: 'ABC123', dailyRate: 45, available: true },
  { id: 2, make: 'Honda', model: 'Civic', year: 2023, registration: 'DEF456', dailyRate: 40, available: true },
  { id: 3, make: 'BMW', model: 'X5', year: 2023, registration: 'GHI789', dailyRate: 80, available: false },
  { id: 4, make: 'Mercedes', model: 'C-Class', year: 2023, registration: 'JKL012', dailyRate: 75, available: true }
];

const mockBranches = [
  { id: 1, name: 'Downtown Branch', city: 'Nairobi' },
  { id: 2, name: 'Westlands Branch', city: 'Nairobi' },
  { id: 3, name: 'Mombasa Branch', city: 'Mombasa' }
];

const CreateBookingForm: React.FC<CreateBookingFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<Partial<CreateBookingRequest>>({
    customer_id: undefined,
    vehicle_id: undefined,
    model_id: undefined,
    pickup_date: '',
    return_date: '',
    pickup_branch_id: undefined,
    return_branch_id: undefined,
    rate_per_day: 0,
    notes: ''
  });

  const [availability, setAvailability] = useState<boolean | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const [createBooking, { isLoading }] = BookingApi.useCreateBookingMutation();
  const [checkAvailability] = BookingApi.useCheckVehicleAvailabilityQuery;

  const selectedVehicle = mockVehicles.find(v => v.id === formData.vehicle_id);
  const selectedCustomer = mockCustomers.find(c => c.id === formData.customer_id);

  useEffect(() => {
    if (formData.vehicle_id && formData.pickup_date && formData.return_date) {
      checkVehicleAvailability();
    }
  }, [formData.vehicle_id, formData.pickup_date, formData.return_date]);

  const checkVehicleAvailability = async () => {
    if (!formData.vehicle_id || !formData.pickup_date || !formData.return_date) return;

    setIsCheckingAvailability(true);
    try {
      // This would be the actual API call
      // const result = await checkAvailability({
      //   vehicleId: formData.vehicle_id,
      //   pickupDate: formData.pickup_date,
      //   returnDate: formData.return_date
      // }).unwrap();
      
      // Simulate API call
      setTimeout(() => {
        const vehicle = mockVehicles.find(v => v.id === formData.vehicle_id);
        setAvailability(vehicle?.available || false);
        setIsCheckingAvailability(false);
      }, 1000);
    } catch (error) {
      setAvailability(false);
      setIsCheckingAvailability(false);
    }
  };

  const calculateRentalDays = () => {
    if (!formData.pickup_date || !formData.return_date) return 0;
    
    const pickup = new Date(formData.pickup_date);
    const return_ = new Date(formData.return_date);
    const diffTime = Math.abs(return_.getTime() - pickup.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateEstimatedTotal = () => {
    const days = calculateRentalDays();
    const dailyRate = formData.rate_per_day || selectedVehicle?.dailyRate || 0;
    return days * dailyRate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.vehicle_id || !formData.pickup_date || !formData.return_date) {
      Swal.fire('Error!', 'Please fill in all required fields', 'error');
      return;
    }

    if (availability === false) {
      Swal.fire('Error!', 'Selected vehicle is not available for the chosen dates', 'error');
      return;
    }

    try {
      await createBooking(formData as CreateBookingRequest).unwrap();
      Swal.fire('Success!', 'Booking created successfully', 'success');
      onSuccess();
    } catch (error) {
      Swal.fire('Error!', 'Failed to create booking', 'error');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-set model_id when vehicle is selected
    if (field === 'vehicle_id') {
      const vehicle = mockVehicles.find(v => v.id === value);
      if (vehicle) {
        setFormData(prev => ({
          ...prev,
          vehicle_id: value,
          model_id: vehicle.id, // In real app, this would be the actual model_id
          rate_per_day: vehicle.dailyRate
        }));
      }
    }
  };

  const rentalDays = calculateRentalDays();
  const estimatedTotal = calculateEstimatedTotal();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Booking</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="form-control">
          <label className="label">
            <span className="label-text flex items-center gap-2">
              <User size={16} />
              Select Customer *
            </span>
          </label>
          <select
            value={formData.customer_id || ''}
            onChange={(e) => handleInputChange('customer_id', e.target.value ? parseInt(e.target.value) : undefined)}
            className="select select-bordered"
            required
          >
            <option value="">Choose a customer</option>
            {mockCustomers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Selection */}
        <div className="form-control">
          <label className="label">
            <span className="label-text flex items-center gap-2">
              <Car size={16} />
              Select Vehicle *
            </span>
          </label>
          <select
            value={formData.vehicle_id || ''}
            onChange={(e) => handleInputChange('vehicle_id', e.target.value ? parseInt(e.target.value) : undefined)}
            className="select select-bordered"
            required
          >
            <option value="">Choose a vehicle</option>
            {mockVehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id} disabled={!vehicle.available}>
                {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.registration}
                {!vehicle.available && ' - Not Available'}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Calendar size={16} />
                Pickup Date *
              </span>
            </label>
            <input
              type="date"
              value={formData.pickup_date}
              onChange={(e) => handleInputChange('pickup_date', e.target.value)}
              className="input input-bordered"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Calendar size={16} />
                Return Date *
              </span>
            </label>
            <input
              type="date"
              value={formData.return_date}
              onChange={(e) => handleInputChange('return_date', e.target.value)}
              className="input input-bordered"
              min={formData.pickup_date || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        {/* Branch Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <MapPin size={16} />
                Pickup Branch
              </span>
            </label>
            <select
              value={formData.pickup_branch_id || ''}
              onChange={(e) => handleInputChange('pickup_branch_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="select select-bordered"
            >
              <option value="">Any branch</option>
              {mockBranches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} - {branch.city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <MapPin size={16} />
                Return Branch
              </span>
            </label>
            <select
              value={formData.return_branch_id || ''}
              onChange={(e) => handleInputChange('return_branch_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="select select-bordered"
            >
              <option value="">Any branch</option>
              {mockBranches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} - {branch.city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rate and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <DollarSign size={16} />
                Daily Rate *
              </span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.rate_per_day}
              onChange={(e) => handleInputChange('rate_per_day', parseFloat(e.target.value) || 0)}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Notes</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="textarea textarea-bordered"
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>

        {/* Availability Check */}
        {formData.vehicle_id && formData.pickup_date && formData.return_date && (
          <div className="alert alert-info">
            <div className="flex items-center gap-2">
              {isCheckingAvailability ? (
                <>
                  <div className="loading loading-spinner loading-sm"></div>
                  <span>Checking vehicle availability...</span>
                </>
              ) : availability === true ? (
                <>
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Vehicle is available for the selected dates</span>
                </>
              ) : availability === false ? (
                <>
                  <XCircle size={16} className="text-red-600" />
                  <span>Vehicle is not available for the selected dates</span>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Summary */}
        {(rentalDays > 0 || estimatedTotal > 0) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Rental Period:</span>
                <span>{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Rate:</span>
                <span>${formData.rate_per_day || selectedVehicle?.dailyRate}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                <span>Estimated Total:</span>
                <span>${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onSuccess}
            className="btn btn-ghost flex-1"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={isLoading || availability === false}
          >
            {isLoading ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBookingForm;