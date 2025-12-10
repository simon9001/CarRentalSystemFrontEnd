// src/pages/AllBookings.tsx
import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../dashboardDesign/DashboardLayout'
import { 
  Car, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Key, 
  AlertCircle,
  RotateCcw,
  Check,
  X
} from 'lucide-react'
import { BookingApi } from '../../features/Api/BookingApi.ts'
import { PaymentApi } from '../../features/Api/PaymentApi.ts'
import { useSelector } from 'react-redux'
import { skipToken } from '@reduxjs/toolkit/query'
import type { RootState } from '../../store/store'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router'
import PaymentPage from './PaymentPage.tsx'
import { BookingReceipt } from '../../Componnents/User/Bookings/BookingReceipt.tsx'

const AllBookings: React.FC = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<'list' | 'payment' | 'receipt'>('list');
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [bookingToCancel, setBookingToCancel] = useState<any>(null);
    const [bookingToPickup, setBookingToPickup] = useState<any>(null);

    // Use BookingApi to fetch all bookings for the customer
    const { data: customerBookings, isLoading, error, refetch } = BookingApi.useGetBookingsByCustomerQuery(
        isAuthenticated && user ? user.user_id : skipToken
    );

    // RTK mutations from BookingApi
    const [cancelBooking] = BookingApi.useCancelBookingMutation();
    const [initiateBookingWithPayment] = BookingApi.useInitiateBookingWithPaymentMutation();
    const [activateBooking] = BookingApi.useActivateBookingMutation();
    
    // Get payments for booking to check refund eligibility
    const [getBookingPayments] = PaymentApi.useLazyGetPaymentsByBookingQuery();

    // Helper functions for booking status
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
            confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
            active: { color: 'bg-purple-100 text-purple-800', icon: Car, label: 'Active' },
            completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
            cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
            overdue: { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'Overdue' },
        };

        const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;
        const IconComponent = config.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <IconComponent size={14} className="mr-1" />
                {config.label}
            </span>
        );
    };

    const getVehicleTypeIcon = (vehicleType: string) => {
        const icons = {
            sedan: '🚗',
            suv: '🚙',
            truck: '🚚',
            motorcycle: '🏍️',
            van: '🚐',
            luxury: '🏎️',
            hatchback: '🚘',
            coupe: '🚗',
            convertible: '🚗',
            minivan: '🚐',
            pickup: '🛻'
        };
        return icons[vehicleType.toLowerCase() as keyof typeof icons] || '🚗';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    // Check if booking can be cancelled (before pickup time)
    const canCancelBooking = (booking: any): boolean => {
        if (!booking) return false;
        
        // Only pending or confirmed bookings can be cancelled
        if (!['pending', 'confirmed'].includes(booking.booking_status?.toLowerCase())) {
            return false;
        }
        
        // Check if pickup time has passed
        const pickupDate = new Date(booking.pickup_date);
        const now = new Date();
        
        // Allow cancellation up to 1 minute before pickup
        const oneMinuteBeforePickup = new Date(pickupDate.getTime() - 60000);
        
        return now <= oneMinuteBeforePickup;
    };

    // Check if booking can be picked up (confirmed and pickup time reached)
    const canPickupBooking = (booking: any): boolean => {
        if (!booking) return false;
        
        // Only confirmed bookings can be picked up
        if (booking.booking_status?.toLowerCase() !== 'confirmed') {
            return false;
        }
        
        // Check if pickup time has been reached
        const pickupDate = new Date(booking.pickup_date);
        const now = new Date();
        
        return now >= pickupDate;
    };

    // Calculate time until pickup
    const getTimeUntilPickup = (pickupDate: string): string => {
        const pickup = new Date(pickupDate);
        const now = new Date();
        const diffMs = pickup.getTime() - now.getTime();
        
        if (diffMs <= 0) return 'Pickup time has passed';
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
        if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`;
        return `${diffMinutes}m`;
    };

    // Handle booking cancellation
    const handleCancelBooking = async (booking: any) => {
        setBookingToCancel(booking);
        setCancellationReason('');
        setShowCancelModal(true);
    };

    // Process cancellation
    const processCancellation = async () => {
        if (!bookingToCancel) return;
        
        try {
            // First, get payment details to check refund eligibility
            const paymentResult = await getBookingPayments(bookingToCancel.booking_id).unwrap();
            const payments = paymentResult.data?.payments || [];
            const completedPayment = payments.find((p: any) => p.payment_status === 'Completed');
            
            // Check if booking can be cancelled (before pickup time)
            const canCancel = canCancelBooking(bookingToCancel);
            
            if (!canCancel) {
                Swal.fire({
                    icon: 'error',
                    title: 'Cannot Cancel',
                    text: 'You can only cancel bookings before the pickup time.',
                });
                setShowCancelModal(false);
                return;
            }
            
            // Show confirmation with refund information
            let refundMessage = '';
            if (completedPayment) {
                refundMessage = `<br><br><strong>💰 Refund Information:</strong><br>
                               • Payment Amount: ${formatCurrency(completedPayment.amount)}<br>
                               • Refund Status: <span class="text-green-600">Will be automatically processed</span><br>
                               • Refund Method: Original payment method<br>
                               • Processing Time: 5-7 business days`;
            }
            
            const result = await Swal.fire({
                title: "Cancel Booking?",
                html: `Are you sure you want to cancel booking #${bookingToCancel.booking_id}?${refundMessage}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc2626",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Yes, Cancel Booking",
                cancelButtonText: "Keep Booking",
                showLoaderOnConfirm: true,
                preConfirm: async () => {
                    try {
                        const res = await cancelBooking({ 
                            bookingId: bookingToCancel.booking_id, 
                            cancellationReason: cancellationReason || "Cancelled by customer" 
                        }).unwrap();
                        return res;
                    } catch (error: any) {
                        Swal.showValidationMessage(`Cancellation failed: ${error.message || 'Unknown error'}`);
                        return null;
                    }
                }
            });

            if (result.isConfirmed && result.value) {
                Swal.fire({
                    title: "Cancelled!",
                    html: `Booking #${bookingToCancel.booking_id} has been cancelled successfully.${completedPayment ? '<br><br>✅ <strong>Refund has been initiated automatically!</strong>' : ''}`,
                    icon: "success",
                    timer: 3000,
                    timerProgressBar: true,
                });
                refetch();
            }
            
        } catch (error: any) {
            console.error('Cancellation error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Cancellation Failed',
                text: error.message || 'Failed to cancel booking. Please try again.',
            });
        } finally {
            setShowCancelModal(false);
            setBookingToCancel(null);
            setCancellationReason('');
        }
    };

    // Handle pickup confirmation
    const handlePickupBooking = async (booking: any) => {
        setBookingToPickup(booking);
        setShowPickupModal(true);
    };

    // Process pickup confirmation
    const processPickup = async () => {
        if (!bookingToPickup) return;
        
        try {
            const result = await Swal.fire({
                title: "Confirm Vehicle Pickup",
                html: `Are you picking up the vehicle now?<br><br>
                      <strong>Booking Details:</strong><br>
                      • Booking ID: #${bookingToPickup.booking_id}<br>
                      • Vehicle: ${bookingToPickup.make} ${bookingToPickup.model}<br>
                      • Pickup Location: ${bookingToPickup.pickup_branch_name || 'N/A'}`,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#059669",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Yes, I'm Picking Up Now",
                cancelButtonText: "Not Yet",
                showLoaderOnConfirm: true,
                preConfirm: async () => {
                    try {
                        const res = await activateBooking(bookingToPickup.booking_id).unwrap();
                        return res;
                    } catch (error: any) {
                        Swal.showValidationMessage(`Pickup confirmation failed: ${error.message || 'Unknown error'}`);
                        return null;
                    }
                }
            });

            if (result.isConfirmed && result.value) {
                Swal.fire({
                    title: "Pickup Confirmed!",
                    text: `Booking #${bookingToPickup.booking_id} is now active. Enjoy your trip!`,
                    icon: "success",
                    timer: 3000,
                    timerProgressBar: true,
                });
                refetch();
            }
            
        } catch (error: any) {
            console.error('Pickup confirmation error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Pickup Failed',
                text: error.message || 'Failed to confirm pickup. Please try again.',
            });
        } finally {
            setShowPickupModal(false);
            setBookingToPickup(null);
        }
    };

    const handlePayNow = async (booking: any) => {
        try {
            // For pending bookings, initiate payment
            const bookingRequest = {
                customer_id: user.user_id,
                vehicle_id: booking.vehicle_id,
                model_id: booking.model_id,
                pickup_date: booking.pickup_date,
                return_date: booking.return_date,
                pickup_branch_id: booking.pickup_branch_id,
                return_branch_id: booking.return_branch_id,
                rate_per_day: booking.rate_per_day,
                payment_method: 'paystack'
            };

            const result = await initiateBookingWithPayment(bookingRequest).unwrap();
            
            setSelectedBooking(result.data.booking);
            setSelectedPayment(result.data.payment);
            setCurrentView('payment');
        } catch (error) {
            console.error('Payment initiation failed:', error);
            Swal.fire("Payment Error", "Failed to initiate payment. Please try again.", "error");
        }
    };

    const handlePaymentSuccess = (booking: any, payment: any) => {
        setSelectedBooking(booking);
        setSelectedPayment(payment);
        setCurrentView('receipt');
        refetch();
    };

    const handlePaymentFailure = () => {
        Swal.fire("Payment Failed", "Your payment was not completed. Please try again.", "error");
        setCurrentView('list');
    };

    const handlePrintReceipt = () => {
        Swal.fire("Success", "Receipt printed successfully!", "success");
    };

    const handleCloseReceipt = () => {
        setCurrentView('list');
        setSelectedBooking(null);
        setSelectedPayment(null);
    };

    const handleBackToBookings = () => {
        navigate('/dashboard/bookings');
    }

    // Render different views based on current state
    if (currentView === 'payment' && selectedBooking && selectedPayment) {
        return (
            <DashboardLayout>
                <PaymentPage
                    booking={selectedBooking}
                    payment={selectedPayment}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentFailure={handlePaymentFailure}
                    onBack={() => setCurrentView('list')}
                />
            </DashboardLayout>
        );
    }

    if (currentView === 'receipt' && selectedBooking && selectedPayment) {
        return (
            <DashboardLayout>
                <BookingReceipt
                    booking={selectedBooking}
                    payment={selectedPayment}
                    onPrint={handlePrintReceipt}
                    onClose={handleCloseReceipt}
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Cancel Modal */}
            {showCancelModal && bookingToCancel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Cancel Booking #{bookingToCancel.booking_id}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-yellow-800">Cancellation Policy</h4>
                                            <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                                                <li>• Cancellations before pickup time: Full refund</li>
                                                <li>• Cancellations after pickup: No refund</li>
                                                <li>• Refunds processed to original payment method</li>
                                                <li>• Refunds take 5-7 business days</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cancellation Reason (Optional)
                                    </label>
                                    <textarea
                                        value={cancellationReason}
                                        onChange={(e) => setCancellationReason(e.target.value)}
                                        placeholder="Please tell us why you're cancelling..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setBookingToCancel(null);
                                        setCancellationReason('');
                                    }}
                                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={processCancellation}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                >
                                    Confirm Cancellation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pickup Modal */}
            {showPickupModal && bookingToPickup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Key size={20} className="text-green-600" />
                                Confirm Vehicle Pickup
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle size={20} className="text-green-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-green-800">Pickup Information</h4>
                                            <ul className="text-green-700 text-sm mt-1 space-y-1">
                                                <li>• Confirm that you have received the vehicle</li>
                                                <li>• Verify vehicle condition matches agreement</li>
                                                <li>• Review all provided documentation</li>
                                                <li>• Keep rental agreement for reference</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Booking Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Booking ID:</span>
                                            <span className="font-semibold">#{bookingToPickup.booking_id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Vehicle:</span>
                                            <span className="font-semibold">{bookingToPickup.make} {bookingToPickup.model}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Pickup Location:</span>
                                            <span className="font-semibold">{bookingToPickup.pickup_branch_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Pickup Time:</span>
                                            <span className="font-semibold">{formatDate(bookingToPickup.pickup_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowPickupModal(false);
                                        setBookingToPickup(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                >
                                    Not Yet
                                </button>
                                <button
                                    onClick={processPickup}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                                >
                                    <Check size={18} />
                                    Confirm Pickup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBackToBookings}
                        className="btn btn-ghost btn-circle hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Car className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">All Bookings</h1>
                        <p className="text-sm text-gray-600">
                            {customerBookings ? `Total ${customerBookings.length} bookings` : 'Loading...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* All Bookings Content */}
            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                    <span className="ml-3 text-gray-600">Loading all bookings...</span>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <XCircle className="mx-auto text-red-500 mb-3" size={48} />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Bookings</h3>
                    <p className="text-red-600">Unable to fetch your bookings. Please try again later.</p>
                </div>
            ) : !customerBookings || customerBookings.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <Car className="mx-auto text-gray-400 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
                    <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
                    <button
                        onClick={() => navigate('/vehicles')}
                        className="btn bg-blue-800 hover:bg-blue-900 text-white"
                    >
                        Browse Vehicles
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Active</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {customerBookings.filter((b: any) => 
                                            ['confirmed', 'active'].includes(b.booking_status?.toLowerCase())
                                        ).length}
                                    </p>
                                </div>
                                <CheckCircle size={24} className="text-green-500" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Pending Payment</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {customerBookings.filter((b: any) => 
                                            b.booking_status?.toLowerCase() === 'pending'
                                        ).length}
                                    </p>
                                </div>
                                <Clock size={24} className="text-yellow-500" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Completed</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {customerBookings.filter((b: any) => 
                                            b.booking_status?.toLowerCase() === 'completed'
                                        ).length}
                                    </p>
                                </div>
                                <CheckCircle size={24} className="text-blue-500" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Cancelled</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {customerBookings.filter((b: any) => 
                                            b.booking_status?.toLowerCase() === 'cancelled'
                                        ).length}
                                    </p>
                                </div>
                                <XCircle size={24} className="text-red-500" />
                            </div>
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left font-semibold text-gray-700">Booking ID</th>
                                        <th className="text-left font-semibold text-gray-700">Vehicle</th>
                                        <th className="text-left font-semibold text-gray-700">Status</th>
                                        <th className="text-left font-semibold text-gray-700">Pickup Date</th>
                                        <th className="text-left font-semibold text-gray-700">Return Date</th>
                                        <th className="text-left font-semibold text-gray-700">Total</th>
                                        <th className="text-center font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerBookings.map((booking: any) => {
                                        const canCancel = canCancelBooking(booking);
                                        const canPickup = canPickupBooking(booking);
                                        const isBeforePickup = canCancel;
                                        
                                        return (
                                            <tr key={booking.booking_id} className="hover:bg-gray-50">
                                                <td className="font-bold text-gray-800">#{booking.booking_id}</td>
                                                <td>
                                                    <div>
                                                        <div className="font-semibold text-blue-800">{booking.make} {booking.model}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <MapPin size={12} />
                                                            {booking.pickup_branch_name || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        {getStatusBadge(booking.booking_status)}
                                                        {isBeforePickup && booking.booking_status?.toLowerCase() === 'confirmed' && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Pickup in: {getTimeUntilPickup(booking.pickup_date)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar size={12} />
                                                        {formatDate(booking.pickup_date)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar size={12} />
                                                        {formatDate(booking.return_date)}
                                                    </div>
                                                </td>
                                                <td className="font-bold text-blue-600">
                                                    {formatCurrency(booking.final_total || booking.calculated_total || 0)}
                                                </td>
                                                <td className="text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        {booking.booking_status?.toLowerCase() === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handlePayNow(booking)}
                                                                    className="btn bg-green-600 hover:bg-green-700 text-white btn-xs flex items-center gap-1"
                                                                >
                                                                    <CreditCard size={12} />
                                                                    Pay Now
                                                                </button>
                                                                {canCancel && (
                                                                    <button
                                                                        onClick={() => handleCancelBooking(booking)}
                                                                        className="btn btn-outline btn-error btn-xs"
                                                                    >
                                                                        <X size={12} />
                                                                        Cancel
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                        
                                                        {booking.booking_status?.toLowerCase() === 'confirmed' && (
                                                            <>
                                                                {canPickup && (
                                                                    <button
                                                                        onClick={() => handlePickupBooking(booking)}
                                                                        className="btn bg-green-600 hover:bg-green-700 text-white btn-xs flex items-center gap-1"
                                                                    >
                                                                        <Key size={12} />
                                                                        Pick Up
                                                                    </button>
                                                                )}
                                                                {canCancel && (
                                                                    <button
                                                                        onClick={() => handleCancelBooking(booking)}
                                                                        className="btn btn-outline btn-error btn-xs"
                                                                    >
                                                                        <X size={12} />
                                                                        Cancel
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                        
                                                        {booking.booking_status?.toLowerCase() === 'active' && (
                                                            <span className="text-xs text-green-600 flex items-center justify-center gap-1">
                                                                <CheckCircle size={12} />
                                                                In Progress
                                                            </span>
                                                        )}
                                                        
                                                        {booking.booking_status?.toLowerCase() === 'completed' && (
                                                            <button 
                                                                onClick={() => navigate('/vehicles')}
                                                                className="btn bg-blue-800 hover:bg-blue-900 text-white btn-xs"
                                                            >
                                                                Book Again
                                                            </button>
                                                        )}
                                                        
                                                        {booking.booking_status?.toLowerCase() === 'cancelled' && (
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs text-red-500 flex items-center gap-1">
                                                                    <XCircle size={12} />
                                                                    Cancelled
                                                                </span>
                                                                {booking.cancellation_reason && (
                                                                    <div className="text-xs text-gray-500 mt-1 max-w-[100px] truncate" title={booking.cancellation_reason}>
                                                                        {booking.cancellation_reason}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Booking Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Booking Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-blue-700 mb-2">Payment & Cancellation</h4>
                                <ul className="text-blue-700 text-sm space-y-1">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Pay for pending bookings to confirm your reservation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <RotateCcw size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Full refund available if cancelled before pickup time</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>No refund after pickup - booking becomes active</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-700 mb-2">Pickup Process</h4>
                                <ul className="text-blue-700 text-sm space-y-1">
                                    <li className="flex items-start gap-2">
                                        <Key size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Click "Pick Up" when you receive the vehicle at the specified location</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Confirm vehicle condition matches the agreement</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Car size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Keep rental agreement and insurance documents safe</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default AllBookings;