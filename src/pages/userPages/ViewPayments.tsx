// src/Components/User/Payments/PaymentsView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Receipt, 
  ArrowLeft, 
  RotateCcw,
  Info,
  Calendar,
  Car
} from 'lucide-react';
import { useGetBookingsByCustomerQuery } from '../../features/Api/BookingApi';
import { 
  useGetCustomerPaymentsQuery, 
  useProcessRefundMutation 
} from '../../features/Api/PaymentApi';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../dashboardDesign/DashboardLayout';

interface Payment {
  payment_id: number;
  booking_id: number;
  amount: number;
  payment_method: 'Mpesa' | 'Cash' | 'Card' | 'Bank Transfer' | string;
  transaction_code: string | null;
  payment_date: string;
  payment_status: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Partially_Refunded';
  refund_amount: number;
}

interface Booking {
  booking_id: number;
  pickup_date: string;
  return_date: string;
  actual_return_date: string | null;
  booking_status: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled' | 'Overdue';
  calculated_total: number;
  final_total: number;
  customer_id: number;
  vehicle_id: number;
  vehicle?: {
    make: string;
    model: string;
    year: number;
  };
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

interface PaymentWithBooking extends Payment {
  booking?: Booking;
  canRefund?: boolean;
  refundReason?: string;
}

interface RefundRequest {
  payment_id: number;
  refund_amount: number;
  is_partial?: boolean;
  reason?: string;
}

// Declare Paystack types
declare global {
  interface Window {
    PaystackPop: {
      setup(options: any): { openIframe: () => void };
    };
  }
}

const PaymentsView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: AuthState) => state.auth);
  const customerId = user?.customer_id || user?.user_id;
  
  // State
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithBooking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [paystackError, setPaystackError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'refundable'>('pending');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('');
  const [isPartialRefund, setIsPartialRefund] = useState<boolean>(false);
  const [refundMessage, setRefundMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // API Calls
  const { data: paymentsData, refetch: refetchPayments } = useGetCustomerPaymentsQuery(
    { customerId: customerId || 0 },
    { skip: !customerId }
  );
  
  const { data: bookingsData, refetch: refetchBookings } = useGetBookingsByCustomerQuery(
    customerId || 0,
    { skip: !customerId }
  );
  
  const [processRefund] = useProcessRefundMutation();

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Paystack script loaded successfully');
      setPaystackLoaded(true);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Paystack script');
      setPaystackError('Failed to load payment system.');
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Load payments and bookings data
  useEffect(() => {
    if (paymentsData?.success && paymentsData.data && bookingsData) {
      const paymentsArray = Array.isArray(paymentsData.data) 
        ? paymentsData.data 
        : (paymentsData.data as any).payments || [];
      
      // Enrich payments with booking data and refund eligibility
      const enrichedPayments = paymentsArray.map((payment: Payment) => {
        const booking = bookingsData.find(b => b.booking_id === payment.booking_id);
        const canRefund = checkRefundEligibility(payment, booking);
        
        return {
          ...payment,
          booking,
          canRefund
        };
      });
      
      setPayments(enrichedPayments);
      setLoading(false);
    } else if (paymentsData && !paymentsData.success) {
      setLoading(false);
    }
  }, [paymentsData, bookingsData]);

  // Check if a payment is eligible for refund - FIXED VERSION
  const checkRefundEligibility = (payment: Payment, booking?: Booking): boolean => {
    // Use a switch statement to handle all payment status cases properly
    switch (payment.payment_status) {
      case 'Completed':
        // Completed payments can potentially be refunded
        break;
      case 'Pending':
      case 'Failed':
      case 'Refunded':
      case 'Partially_Refunded':
        // These statuses cannot be refunded
        return false;
    }
    
    // Check if payment has already been refunded (by looking at refund_amount)
    if (payment.refund_amount > 0) {
      return false;
    }
    
    if (!booking) {
      return false;
    }
    
    const now = new Date();
    const pickupDate = new Date(booking.pickup_date);
    
    // Refund is only possible if vehicle hasn't been picked up yet
    const hasVehicleBeenPickedUp = booking.booking_status === 'Active' || 
                                  booking.booking_status === 'Completed' ||
                                  now >= pickupDate;
    
    // Also check if booking was cancelled before pickup
    const isCancelledBeforePickup = booking.booking_status === 'Cancelled' && now < pickupDate;
    
    // Allow refund if:
    // 1. Vehicle hasn't been picked up yet AND
    // 2. Payment is completed AND
    // 3. Not already refunded AND
    // 4. Either booking is still pending/confirmed OR cancelled before pickup
    return !hasVehicleBeenPickedUp && 
           (booking.booking_status === 'Pending' || 
            booking.booking_status === 'Confirmed' || 
            isCancelledBeforePickup);
  };

  // Convert USD to KES
  const convertToKES = (usdAmount: number): number => {
    const exchangeRate = 130;
    return Math.round(usdAmount * exchangeRate);
  };

  // Get payment status badge
  const getStatusBadge = (status: string, payment: PaymentWithBooking) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
      case 'Completed':
        if (payment.canRefund) {
          return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed (Refundable)</span>;
        }
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>;
      case 'Failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Failed</span>;
      case 'Refunded':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Refunded</span>;
      case 'Partially_Refunded':
        return <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">Partially Refunded</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  // Handle payment
  const handlePayment = (payment: PaymentWithBooking) => {
    if (!window.PaystackPop || !paystackLoaded) {
      setPaystackError('Payment system is not loaded. Please try again.');
      return;
    }

    if (!user?.email) {
      setPaystackError('User email is required for payment.');
      return;
    }

    setIsProcessing(true);
    setSelectedPayment(payment);
    setPaystackError(null);

    try {
      const amountInKES = convertToKES(payment.amount);
      const paymentRef = `BOOKING_${payment.booking_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const handler = window.PaystackPop.setup({
        key: 'pk_live_93cac7082040adbe2a990511097c191f263e1a9e',
        email: user.email,
        amount: amountInKES * 100,
        currency: 'KES',
        ref: paymentRef,
        label: `Car Rental Payment #${payment.payment_id}`,
        metadata: {
          payment_id: payment.payment_id,
          booking_id: payment.booking_id,
          customer_id: customerId,
        },
        callback: function(response: any) {
          console.log('✅ Paystack callback received:', response);
          
          if (response.status === 'success') {
            // Complete payment on backend
            // This would need to be implemented based on your API
            console.log('Payment successful, reference:', response.reference);
            setIsProcessing(false);
            
            // Refresh payments list
            refetchPayments();
            refetchBookings();
            
            // Show success message
            alert('Payment completed successfully!');
            
            // Navigate to payment details or success page
            navigate(`/payment-success/${payment.payment_id}`, {
              state: {
                payment,
                transactionCode: response.reference
              }
            });
          } else {
            console.error('❌ Payment failed:', response.message);
            setIsProcessing(false);
            setPaystackError(`Payment failed: ${response.message}`);
          }
        },
        onClose: function() {
          console.log('🔒 Payment modal closed by user');
          setIsProcessing(false);
        }
      });
      
      handler.openIframe();
      
    } catch (error: any) {
      console.error('❌ Paystack setup failed:', error);
      setIsProcessing(false);
      setPaystackError(`Failed to initialize payment: ${error.message || 'Please try again.'}`);
    }
  };

  // Handle refund request
  const handleRefundRequest = (payment: PaymentWithBooking) => {
    setSelectedPayment(payment);
    setRefundAmount(payment.amount);
    setIsPartialRefund(false);
    setRefundReason('');
    setRefundMessage(null);
    setShowRefundModal(true);
  };

  // Process refund
  const handleProcessRefund = async () => {
    if (!selectedPayment) return;
    
    try {
      setIsProcessing(true);
      setRefundMessage(null);
      
      const refundRequest: RefundRequest = {
        payment_id: selectedPayment.payment_id,
        refund_amount: refundAmount,
        is_partial: isPartialRefund,
        reason: refundReason
      };
      
      const result = await processRefund(refundRequest).unwrap();
      
      if (result.success) {
        setRefundMessage({
          type: 'success',
          text: isPartialRefund 
            ? 'Partial refund processed successfully!' 
            : 'Full refund processed successfully!'
        });
        
        // Refresh data
        setTimeout(() => {
          refetchPayments();
          refetchBookings();
          setShowRefundModal(false);
          setIsProcessing(false);
        }, 1500);
      } else {
        setRefundMessage({
          type: 'error',
          text: result.message || 'Failed to process refund'
        });
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('❌ Refund processing failed:', error);
      setRefundMessage({
        type: 'error',
        text: error.message || 'Failed to process refund. Please try again.'
      });
      setIsProcessing(false);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return payment.payment_status === 'Pending';
    if (filter === 'completed') return payment.payment_status === 'Completed';
    if (filter === 'refundable') return payment.canRefund;
    return true;
  });

  // Calculate totals
  const totalPending = payments
    .filter(p => p.payment_status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCompleted = payments
    .filter(p => p.payment_status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefundable = payments
    .filter(p => p.canRefund)
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="loading loading-spinner loading-lg text-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Payments</h1>
              <p className="text-gray-600 mt-2">View, pay, and request refunds for your payments</p>
            </div>
            <Receipt size={32} className="text-blue-600" />
          </div>
        </div>

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
              <AlertCircle size={20} className="text-red-600" />
              <div>
                <p className="text-red-700 font-semibold">Payment Error</p>
                <p className="text-red-600 text-sm">{paystackError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Pending</p>
                <p className="text-2xl font-bold text-yellow-600">${totalPending.toFixed(2)}</p>
                <p className="text-gray-500 text-sm">{payments.filter(p => p.payment_status === 'Pending').length} payment(s)</p>
              </div>
              <Clock size={24} className="text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Completed</p>
                <p className="text-2xl font-bold text-green-600">${totalCompleted.toFixed(2)}</p>
                <p className="text-gray-500 text-sm">{payments.filter(p => p.payment_status === 'Completed').length} payment(s)</p>
              </div>
              <CheckCircle size={24} className="text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Refundable</p>
                <p className="text-2xl font-bold text-blue-600">${totalRefundable.toFixed(2)}</p>
                <p className="text-gray-500 text-sm">{payments.filter(p => p.canRefund).length} payment(s)</p>
              </div>
              <RotateCcw size={24} className="text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Payments</p>
                <p className="text-2xl font-bold text-purple-600">{payments.length}</p>
                <p className="text-gray-500 text-sm">{filteredPayments.length} showing</p>
              </div>
              <Receipt size={24} className="text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All Payments
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Pending Payments
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Completed Payments
          </button>
          <button
            onClick={() => setFilter('refundable')}
            className={`px-4 py-2 rounded-lg ${filter === 'refundable' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Refundable Payments
          </button>
        </div>

        {/* Refund Policy Notice */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Refund Policy</h4>
              <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                <li>• Refunds are only available for payments on bookings where the vehicle has not been picked up yet</li>
                <li>• Once a vehicle is picked up (booking status becomes "Active"), refunds are no longer available</li>
                <li>• Partial refunds are available upon request</li>
                <li>• Refund processing may take 5-7 business days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Receipt size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No payments found</p>
                        <p className="text-sm mt-1">You have no {filter === 'all' ? '' : filter} payments</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">#{payment.payment_id}</div>
                        <div className="text-sm text-gray-500">
                          Method: {payment.payment_method}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">Booking #{payment.booking_id}</div>
                        {payment.booking ? (
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Car size={14} />
                              <span>{payment.booking.vehicle?.year} {payment.booking.vehicle?.make} {payment.booking.vehicle?.model}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar size={14} />
                              <span>Pickup: {new Date(payment.booking.pickup_date).toLocaleDateString()}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Booking Status: <span className={`font-medium ${
                                payment.booking.booking_status === 'Active' ? 'text-green-600' :
                                payment.booking.booking_status === 'Completed' ? 'text-blue-600' :
                                payment.booking.booking_status === 'Cancelled' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>
                                {payment.booking.booking_status}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">Booking details not available</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">${payment.amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          KES {convertToKES(payment.amount).toLocaleString()}
                        </div>
                        {payment.refund_amount > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            Refunded: ${payment.refund_amount.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.payment_status, payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.payment_date).toLocaleDateString()}
                        <div className="text-xs text-gray-400">
                          {new Date(payment.payment_date).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col gap-2">
                          {payment.payment_status === 'Pending' ? (
                            <button
                              onClick={() => handlePayment(payment)}
                              disabled={isProcessing || !paystackLoaded}
                              className={`px-4 py-2 rounded-lg font-medium ${
                                isProcessing && selectedPayment?.payment_id === payment.payment_id
                                  ? 'bg-yellow-500 text-white cursor-not-allowed'
                                  : !paystackLoaded
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {isProcessing && selectedPayment?.payment_id === payment.payment_id ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Processing...
                                </div>
                              ) : (
                                'Pay Now'
                              )}
                            </button>
                          ) : payment.payment_status === 'Completed' ? (
                            <>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/payment-details/${payment.payment_id}`)}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                                >
                                  View Details
                                </button>
                                {payment.canRefund && (
                                  <button
                                    onClick={() => handleRefundRequest(payment)}
                                    className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm"
                                  >
                                    Request Refund
                                  </button>
                                )}
                              </div>
                              {payment.transaction_code && (
                                <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                  Ref: {payment.transaction_code}
                                </div>
                              )}
                            </>
                          ) : payment.payment_status === 'Failed' ? (
                            <button
                              onClick={() => handlePayment(payment)}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            >
                              Retry Payment
                            </button>
                          ) : (
                            // For Refunded or Partially_Refunded status
                            <button
                              onClick={() => navigate(`/payment-details/${payment.payment_id}`)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refund Modal */}
        {showRefundModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Request Refund
                </h3>
                
                {refundMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    refundMessage.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {refundMessage.text}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Amount
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      ${selectedPayment.amount.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refund Type
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="refundType"
                          checked={!isPartialRefund}
                          onChange={() => setIsPartialRefund(false)}
                          className="mr-2"
                        />
                        <span>Full Refund (${selectedPayment.amount.toFixed(2)})</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="refundType"
                          checked={isPartialRefund}
                          onChange={() => setIsPartialRefund(true)}
                          className="mr-2"
                        />
                        <span>Partial Refund</span>
                      </label>
                    </div>
                  </div>
                  
                  {isPartialRefund && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Refund Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={selectedPayment.amount}
                        step="0.01"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum: ${selectedPayment.amount.toFixed(2)}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refund Reason (Optional)
                    </label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Please explain why you're requesting a refund..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  
                  {/* Refund Conditions */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">Refund Conditions</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Vehicle must not have been picked up yet</li>
                      <li>• Refunds may take 5-7 business days to process</li>
                      <li>• Refund will be issued to original payment method</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessRefund}
                    disabled={isProcessing || (isPartialRefund && (refundAmount <= 0 || refundAmount > selectedPayment.amount))}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isProcessing
                        ? 'bg-yellow-500 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      'Submit Refund Request'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Payment Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Making Payments</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Click "Pay Now" on any pending payment to complete it</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>You can pay using M-Pesa or Credit/Debit Card</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Refund Requests</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Click "Request Refund" on completed payments where vehicle hasn't been picked up</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Refunds are processed back to your original payment method</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
          <Shield size={16} className="text-green-500" />
          <span>All payments are 100% secure and protected</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentsView;