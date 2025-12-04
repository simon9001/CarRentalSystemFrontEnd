// src/Components/User/Bookings/PaymentPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CreditCard, Smartphone, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCompletePaymentMutation } from '../../features/Api/BookingApi';
import { useSelector } from 'react-redux';
import Footer from '../../Componnents/Footer';
import Navbar from '../../Componnents/Navbar';

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

interface Booking {
  booking_id: number;
  pickup_date: string;
  return_date: string;
  booking_status: string;
  calculated_total: number;
  final_total: number;
  customer_id?: number;
  vehicle_id?: number;
}

interface Payment {
  payment_id: number;
  booking_id: number;
  amount: number;
  payment_method: string;
  transaction_code: string | null;
  payment_status: string;
}

interface PaymentPageProps {
  booking: Booking;
  payment: Payment;
  vehicle: Vehicle;
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

// Declare Paystack types
declare global {
  interface Window {
    PaystackPop: {
      setup(options: any): { openIframe: () => void };
    };
  }
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('🔍 PaymentPage location state:', location.state);
  
  // Check if state exists first
  if (!location.state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Access</h2>
          <p className="text-gray-600 mb-4">No booking information found. Please start your booking again.</p>
          <button 
            onClick={() => navigate('/vehicles')}
            className="btn btn-primary"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  const { booking, payment, vehicle } = location.state as PaymentPageProps;
  
  // Debug logging of received data
  console.log('📦 PaymentPage received booking:', booking);
  console.log('📦 PaymentPage received payment:', payment);
  console.log('📦 PaymentPage received vehicle:', vehicle);
  
  // Get user from Redux store
  const { user } = useSelector((state: AuthState) => state.auth);
  
  const [selectedMethod, setSelectedMethod] = useState<'paystack' | 'card'>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [paystackError, setPaystackError] = useState<string | null>(null);
  
  const [completePayment] = useCompletePaymentMutation();

  // Convert USD to KES (approximate exchange rate)
  const convertToKES = (usdAmount: number): number => {
    const exchangeRate = 130;
    return Math.round(usdAmount * exchangeRate);
  };

  const amountInKES = convertToKES(payment.amount);

  // Validate data
  useEffect(() => {
    if (!booking || !payment || !vehicle) {
      console.error('❌ Missing required data in PaymentPage:', {
        hasBooking: !!booking,
        hasPayment: !!payment,
        hasVehicle: !!vehicle
      });
    }
  }, [booking, payment, vehicle]);

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Paystack script loaded successfully');
      setPaystackLoaded(true);
      setPaystackError(null);
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Paystack script:', error);
      setPaystackLoaded(false);
      setPaystackError('Failed to load payment system. Please check your internet connection.');
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePaystackPayment = () => {
    if (!window.PaystackPop) {
      setPaystackError('Payment system is not loaded. Please try again in a moment.');
      return;
    }

    if (!user?.email) {
      setPaystackError('User email is required for payment.');
      return;
    }

    setIsProcessing(true);
    setPaystackError(null);
    
    try {
      console.log('🚀 Initializing Paystack payment...');
      
      // Create payment reference
      const paymentRef = `BOOKING_${booking.booking_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const handler = window.PaystackPop.setup({
        key: 'pk_live_93cac7082040adbe2a990511097c191f263e1a9e', // Your live key
        // key: 'pk_test_YOUR_TEST_KEY', // Use test key for development
        email: user.email,
        amount: amountInKES * 100, // Convert to kobo/cents
        currency: 'KES',
        ref: paymentRef,
        label: `Car Rental Booking #${booking.booking_id}`,
        metadata: {
          booking_id: booking.booking_id,
          customer_id: user?.customer_id || user?.user_id,
          vehicle_id: vehicle.vehicle_id,
          vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
        },
        callback: function(response: any) {
          console.log('✅ Paystack callback received:', response);
          
          if (response.status === 'success') {
            // Process payment completion
            completePayment({
              paymentId: payment.payment_id,
              transactionCode: response.reference
            })
            .unwrap()
            .then((result) => {
              console.log('✅ Payment completed successfully:', result);
              console.log('📤 Preparing to navigate with vehicle data:', vehicle);
              
              setIsProcessing(false);
              setPaymentStatus('success');
              
              // Navigate to success page with ALL required data
              setTimeout(() => {
                navigate('/booking-success', { 
                  state: { 
                    booking: {
                      ...result.data.booking,
                      // Ensure we have all booking data
                      booking_id: result.data.booking.booking_id || booking.booking_id,
                      pickup_date: result.data.booking.pickup_date || booking.pickup_date,
                      return_date: result.data.booking.return_date || booking.return_date,
                      booking_status: result.data.booking.booking_status || 'Confirmed',
                      calculated_total: result.data.booking.calculated_total || booking.calculated_total,
                      final_total: result.data.booking.final_total || booking.final_total,
                      customer_id: result.data.booking.customer_id || user?.customer_id || user?.user_id
                    },
                    payment: {
                      ...result.data.payment,
                      payment_id: result.data.payment.payment_id || payment.payment_id,
                      amount: result.data.payment.amount || payment.amount,
                      payment_method: result.data.payment.payment_method || payment.payment_method,
                      transaction_code: response.reference,
                      payment_status: 'Completed'
                    },
                    transactionCode: response.reference,
                    vehicle: {
                      vehicle_id: vehicle.vehicle_id,
                      make: vehicle.make,
                      model: vehicle.model,
                      year: vehicle.year,
                      vehicle_type: vehicle.vehicle_type,
                      branch_name: vehicle.branch_name,
                      daily_rate: vehicle.daily_rate,
                      model_id: vehicle.model_id
                    },
                    vehicleData: { // Backup vehicle data
                      year: vehicle.year,
                      make: vehicle.make,
                      model: vehicle.model,
                      vehicle_type: vehicle.vehicle_type,
                      vehicle_id: vehicle.vehicle_id
                    }
                  },
                  replace: true
                });
              }, 1500);
            })
            .catch((error) => {
              console.error('❌ Payment completion failed:', error);
              setIsProcessing(false);
              setPaymentStatus('failed');
              setPaystackError(`Payment verification failed: ${error.message || 'Please contact support.'}`);
            });
          } else {
            console.error('❌ Payment failed:', response.message);
            setIsProcessing(false);
            setPaymentStatus('failed');
            setPaystackError(`Payment failed: ${response.message}`);
          }
        },
        onClose: function() {
          console.log('🔒 Paystack payment modal closed by user');
          setIsProcessing(false);
          setPaymentStatus('pending');
        }
      });
      
      console.log('📦 Paystack handler created, opening iframe...');
      handler.openIframe();
      
    } catch (error: any) {
      console.error('❌ Paystack setup failed:', error);
      setIsProcessing(false);
      setPaymentStatus('failed');
      setPaystackError(`Failed to initialize payment: ${error.message || 'Please try again.'}`);
    }
  };

  const handlePayment = () => {
    if (!paystackLoaded) {
      setPaystackError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    switch (selectedMethod) {
      case 'paystack':
        handlePaystackPayment();
        break;
      case 'card':
        alert('Card payment integration coming soon');
        break;
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Calculate rental days safely
  let rentalDays = 0;
  try {
    rentalDays = Math.ceil(
      (new Date(booking.return_date).getTime() - new Date(booking.pickup_date).getTime()) / (1000 * 60 * 60 * 24)
    );
  } catch (error) {
    console.error('Error calculating rental days:', error);
    rentalDays = 1;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Navbar />

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Booking
        </button>

        {/* Payment System Status */}
        {!paystackLoaded && !paystackError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="loading loading-spinner loading-sm text-yellow-600"></div>
              <p className="text-yellow-700">Payment system is loading...</p>
            </div>
          </div>
        )}

        {paystackError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-red-600">⚠️</div>
              <div>
                <p className="text-red-700 font-semibold">Payment Error</p>
                <p className="text-red-600 text-sm">{paystackError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Complete Payment</h1>
                <p className="text-blue-100">Secure payment for your car rental booking</p>
              </div>
              <Shield size={32} className="text-blue-200" />
            </div>
          </div>

          <div className="p-6">
            {paymentStatus === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-4">Your booking has been confirmed and payment processed successfully.</p>
                <p className="text-sm text-gray-500">Redirecting to booking details...</p>
              </div>
            ) : paymentStatus === 'failed' ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-4xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-4">{paystackError || 'There was an issue processing your payment.'}</p>
                <button
                  onClick={() => {
                    setPaymentStatus('pending');
                    setPaystackError(null);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-semibold">#{booking.booking_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-semibold">{vehicle?.year || 'N/A'} {vehicle?.make || ''} {vehicle?.model || ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{rentalDays} day{rentalDays !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup Date:</span>
                      <span className="font-semibold">{booking.pickup_date ? new Date(booking.pickup_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return Date:</span>
                      <span className="font-semibold">{booking.return_date ? new Date(booking.return_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-600 border-t pt-3">
                      <span>Total Amount:</span>
                      <span>KES {amountInKES.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      (Approx. ${payment.amount?.toFixed(2) || '0'} USD)
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h3>
                  
                  <div className="space-y-4 mb-6">
                    {/* Paystack Option */}
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedMethod === 'paystack' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedMethod('paystack')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Smartphone size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">M-Pesa & Card</h4>
                            <p className="text-sm text-gray-600">Pay with M-Pesa or Card via Paystack</p>
                          </div>
                        </div>
                        {selectedMethod === 'paystack' && (
                          <CheckCircle size={20} className="text-green-500" />
                        )}
                      </div>
                    </div>

                    {/* Card Option */}
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedMethod === 'card' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedMethod('card')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <CreditCard size={24} className="text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Credit/Debit Card</h4>
                            <p className="text-sm text-gray-600">Pay with your card directly</p>
                          </div>
                        </div>
                        {selectedMethod === 'card' && (
                          <CheckCircle size={20} className="text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {paystackError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{paystackError}</p>
                    </div>
                  )}

                  {/* Payment Button */}
                  <button 
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
                      isProcessing 
                        ? 'bg-yellow-500 cursor-not-allowed' 
                        : !paystackLoaded
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                    onClick={handlePayment}
                    disabled={isProcessing || !paystackLoaded}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing Payment...</span>
                      </div>
                    ) : !paystackLoaded ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="loading loading-spinner loading-sm"></div>
                        <span>Loading Payment...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Shield size={20} />
                        <span>Pay KES {amountInKES.toLocaleString()}</span>
                      </div>
                    )}
                  </button>

                  {!paystackLoaded && !paystackError && (
                    <p className="text-yellow-600 text-sm text-center mt-2">
                      Payment system is loading. Please wait...
                    </p>
                  )}

                  {/* Security Notice */}
                  <div className="flex items-center justify-center mt-4 text-sm text-gray-600">
                    <Shield size={16} className="mr-2 text-green-500" />
                    <span>Your payment is secure and encrypted</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Debug Info (Optional - remove in production) */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <details className="text-sm">
            <summary className="cursor-pointer font-semibold text-gray-700">Debug Information</summary>
            <div className="mt-2 space-y-2">
              <div><strong>Paystack Loaded:</strong> {paystackLoaded ? 'Yes' : 'No'}</div>
              <div><strong>User Email:</strong> {user?.email || 'Not found'}</div>
              <div><strong>Vehicle Data:</strong> {vehicle ? 'Available' : 'Missing'}</div>
              <div><strong>Rental Days:</strong> {rentalDays}</div>
              <div><strong>Amount in KES:</strong> {amountInKES.toLocaleString()}</div>
            </div>
          </details>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;