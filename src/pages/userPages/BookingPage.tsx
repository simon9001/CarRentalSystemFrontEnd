// src/components/booking/BookingPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Calendar, MapPin, Car, DollarSign, User, Phone, Mail, Shield, CreditCard } from 'lucide-react';
import { useInitiateBookingWithPaymentMutation, useCheckVehicleAvailabilityQuery } from '../../features/Api/BookingApi';
import { useGetActiveBranchesQuery } from '../../features/Api/BranchApi';
import { useSelector } from 'react-redux';
import Navbar from '../../Componnents/Navbar';
import Footer from '../../Componnents/Footer';

interface Vehicle {
  vehicle_id: number;
  make: string;
  model: string;
  year: number;
  daily_rate: number;
  vehicle_type: string;
  branch_id: number;
  branch_name: string;
  model_id: number;
}

interface Branch {
  branch_id: number;
  branch_name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

interface FormData {
  pickupDate: string;
  returnDate: string;
  pickupBranchId: number;
  returnBranchId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  paymentMethod: string;
}

interface BookingResponse {
  booking: {
    booking_id: number;
    pickup_date: string;
    return_date: string;
    booking_status: string;
    calculated_total: number;
    final_total: number;
    customer_id?: number;
    vehicle_id?: number;
  };
  payment: {
    payment_id: number;
    booking_id: number;
    amount: number;
    payment_method: string;
    transaction_code: string | null;
    payment_status: string;
  };
  next_step?: string;
  message?: string;
}

interface AuthState {
  auth: {
    token: string | null;
    user: {
      customer_id?: number;
      user_id?: number;
      email: string;
      full_name: string;
      phone_number?: string;
    } | null;
    refresh_token?: string;
  };
}

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vehicle } = location.state as { vehicle: Vehicle };

  // Get user from Redux store
  const { user } = useSelector((state: AuthState) => state.auth);
  
  const [initiateBooking, { isLoading: isBookingLoading, error: bookingError }] = useInitiateBookingWithPaymentMutation();
  const { data: branchesResponse } = useGetActiveBranchesQuery();
  
  const [formData, setFormData] = useState<FormData>({
    pickupDate: '',
    returnDate: '',
    pickupBranchId: vehicle.branch_id,
    returnBranchId: vehicle.branch_id,
    customerName: user?.full_name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone_number || '',
    notes: '',
    paymentMethod: 'Mpesa'
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [rentalDays, setRentalDays] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  // Check vehicle availability
  const { data: availabilityResponse, refetch: checkAvailability, isLoading: isAvailabilityLoading } = useCheckVehicleAvailabilityQuery({
    vehicleId: vehicle.vehicle_id,
    pickupDate: formData.pickupDate,
    returnDate: formData.returnDate
  }, {
    skip: !formData.pickupDate || !formData.returnDate
  });

  useEffect(() => {
    if (branchesResponse) {
      const branchesData = branchesResponse?.data || branchesResponse || [];
      setBranches(branchesData);
    }
  }, [branchesResponse]);

  useEffect(() => {
    if (formData.pickupDate && formData.returnDate) {
      const pickup = new Date(formData.pickupDate);
      const returnDate = new Date(formData.returnDate);
      const days = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
      setRentalDays(days > 0 ? days : 0);
      setCalculatedTotal(days > 0 ? days * vehicle.daily_rate : 0);
      
      // Check availability when dates change
      if (days > 0) {
        checkAvailability();
      }
    }
  }, [formData.pickupDate, formData.returnDate, vehicle.daily_rate, checkAvailability]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle number fields specifically
    if (name === 'pickupBranchId' || name === 'returnBranchId') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pickupDate || !formData.returnDate) {
      alert('Please select pickup and return dates');
      return;
    }

    if (new Date(formData.pickupDate) >= new Date(formData.returnDate)) {
      alert('Return date must be after pickup date');
      return;
    }

    if (rentalDays === 0) {
      alert('Please select valid rental dates');
      return;
    }

    // Check availability one more time before submitting
    if (!isVehicleAvailable) {
      alert('Vehicle is not available for the selected dates. Please choose different dates.');
      return;
    }

    try {
      const bookingData = {
        customer_id: user?.customer_id || user?.user_id,
        vehicle_id: vehicle.vehicle_id,
        model_id: vehicle.model_id,
        pickup_date: formData.pickupDate,
        return_date: formData.returnDate,
        pickup_branch_id: formData.pickupBranchId,
        return_branch_id: formData.returnBranchId,
        rate_per_day: vehicle.daily_rate,
        notes: formData.notes,
        payment_method: formData.paymentMethod
      };

      console.log('📦 Submitting booking data:', bookingData);

      const result = await initiateBooking(bookingData).unwrap() as BookingResponse;
      
      console.log('✅ Booking response:', result);
      
      // Debug log the full structure
      console.log('🔍 Full response structure:', JSON.stringify(result, null, 2));
      
      // Check if we have the required data
      if (result?.booking && result?.payment) {
        console.log('🚀 Valid booking and payment data received. Navigating to payment page...');
        console.log('📋 Booking data:', result.booking);
        console.log('💰 Payment data:', result.payment);
        
        // Navigate to payment page
        navigate('/bookings/payment', { 
          state: { 
            booking: result.booking,
            payment: result.payment,
            vehicle: vehicle
          },
          replace: true
        });
      } else {
        console.error('❌ Missing booking or payment data in response:', result);
        
        // Try to show what we received
        if (result.message) {
          console.log('📝 Server message:', result.message);
        }
        
        if (result.next_step) {
          console.log('➡️ Next step:', result.next_step);
        }
        
        // If we have partial data but it's nested differently
        const possibleBooking = (result as any).data?.booking || result.booking;
        const possiblePayment = (result as any).data?.payment || result.payment;
        
        if (possibleBooking && possiblePayment) {
          console.log('🔄 Found data in alternative structure');
          navigate('/bookings/payment', { 
            state: { 
              booking: possibleBooking,
              payment: possiblePayment,
              vehicle: vehicle
            },
            replace: true
          });
        } else {
          throw new Error('Booking created but payment initialization failed. Please contact support.');
        }
      }
    } catch (error: any) {
      console.error('❌ Booking failed:', error);
      
      let errorMessage = 'Failed to create booking. Please try again.';
      
      if (error?.status === 409) {
        errorMessage = 'Vehicle is not available for the selected dates. Please choose different dates.';
      } else if (error?.status === 400) {
        errorMessage = error?.data?.error || 'Invalid booking data. Please check your inputs.';
      } else if (error?.status === 404) {
        errorMessage = 'Vehicle or customer not found.';
      } else if (error?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(`Booking failed: ${errorMessage}`);
    }
  };

  // Fix: Check the correct availability structure
  const isVehicleAvailable = availabilityResponse?.data?.available === true || 
                            availabilityResponse?.available === true ||
                            (availabilityResponse && typeof availabilityResponse === 'object' && 'available' in availabilityResponse && availabilityResponse.available === true);
  
  const canProceed = formData.pickupDate && formData.returnDate && rentalDays > 0 && isVehicleAvailable;

  // Debug information
  const debugInfo = {
    canProceed,
    rentalDays,
    isVehicleAvailable,
    isAvailabilityLoading,
    isBookingLoading,
    formData,
    availabilityResponse,
    user: user ? { 
      id: user.user_id || user.customer_id, 
      name: user.full_name,
      email: user.email 
    } : 'No user'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Navbar />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Complete Your Booking</h1>
                <p className="text-blue-100 mt-2">Book your {vehicle.make} {vehicle.model} in just a few steps</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded"
              >
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </button>
            </div>
          </div>

          {/* Debug Info */}
          {showDebug && (
            <div className="bg-yellow-50 border border-yellow-200 p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Debug Information:</h3>
              <pre className="text-xs text-yellow-700 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="p-6">
            {/* Vehicle Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-100">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Car className="w-10 h-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-gray-600 text-lg">{vehicle.vehicle_type}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <MapPin size={16} />
                    <span>{vehicle.branch_name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">${vehicle.daily_rate.toFixed(2)}<span className="text-lg font-normal">/day</span></p>
                  <p className="text-gray-600 text-sm">Base rate</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Rental Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full input input-bordered input-lg focus:input-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Return Date
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                    min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                    className="w-full input input-bordered input-lg focus:input-primary"
                    required
                  />
                </div>
              </div>

              {/* Availability Check */}
              {formData.pickupDate && formData.returnDate && rentalDays > 0 && (
                <div className={`p-4 rounded-lg border-2 ${
                  isAvailabilityLoading ? 'bg-yellow-50 border-yellow-300' :
                  isVehicleAvailable ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                }`}>
                  {isAvailabilityLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="loading loading-spinner loading-md text-yellow-600"></div>
                      <div>
                        <p className="text-yellow-800 font-semibold">Checking availability...</p>
                        <p className="text-yellow-700 text-sm">Please wait while we verify the vehicle availability</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={`font-semibold text-lg ${
                        isVehicleAvailable ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {isVehicleAvailable 
                          ? '✅ Vehicle is available for your selected dates'
                          : '❌ Vehicle is not available for your selected dates'
                        }
                      </p>
                      <p className="text-gray-600 mt-1">
                        {rentalDays} day{rentalDays !== 1 ? 's' : ''} rental • 
                        Total: <span className="font-semibold">${calculatedTotal.toFixed(2)}</span>
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Branch Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Pickup Branch
                  </label>
                  <select
                    name="pickupBranchId"
                    value={formData.pickupBranchId}
                    onChange={handleInputChange}
                    className="w-full select select-bordered select-lg focus:select-primary"
                  >
                    {branches.map(branch => (
                      <option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name} - {branch.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Return Branch
                  </label>
                  <select
                    name="returnBranchId"
                    value={formData.returnBranchId}
                    onChange={handleInputChange}
                    className="w-full select select-bordered select-lg focus:select-primary"
                  >
                    {branches.map(branch => (
                      <option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name} - {branch.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Information */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-blue-600" />
                  Your Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full input input-bordered input-lg focus:input-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="w-full input input-bordered input-lg focus:input-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full input input-bordered input-lg focus:input-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full select select-bordered select-lg focus:select-primary"
                    >
                      <option value="Mpesa">Mpesa</option>
                      <option value="card">Card</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full textarea textarea-bordered textarea-lg focus:textarea-primary"
                    rows={3}
                    placeholder="Any special requests, delivery requirements, or additional information..."
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Price Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Daily Rate</span>
                    <span className="font-semibold">${vehicle.daily_rate.toFixed(2)}/day</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Rental Duration</span>
                    <span className="font-semibold">{rentalDays} day{rentalDays !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">${calculatedTotal.toFixed(2)}</span>
                  </div>
                  {rentalDays > 0 && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      All taxes and fees included
                    </p>
                  )}
                </div>
              </div>

              {/* Security & Action Buttons */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Secure Booking</span>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Your personal information is protected with bank-level security. 
                  Payment details are encrypted and secure.
                </p>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn btn-outline btn-lg flex-1 hover:bg-gray-50"
                  >
                    Back to Vehicles
                  </button>
                  <button
                    type="submit"
                    disabled={!canProceed || isBookingLoading || isAvailabilityLoading}
                    className="btn btn-primary btn-lg flex-1 bg-blue-600 hover:bg-blue-700 border-blue-600 text-white disabled:bg-gray-400 disabled:border-gray-400"
                  >
                    {isBookingLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="loading loading-spinner loading-sm"></div>
                        Processing Booking...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Proceed to Payment
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {bookingError && (
                <div className="alert alert-error bg-red-50 border-red-200 text-red-800">
                  <div>
                    <h4 className="font-semibold">Booking Error</h4>
                    <p>There was an issue creating your booking. Please try again.</p>
                    {bookingError && (
                      <details className="mt-2 text-sm">
                        <summary className="cursor-pointer">Error details</summary>
                        <pre className="mt-2 whitespace-pre-wrap">
                          {JSON.stringify(bookingError, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;