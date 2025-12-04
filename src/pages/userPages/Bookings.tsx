// src/pages/AllBookings.tsx (Updated)
import React, { useState } from 'react'
import DashboardLayout from '../../dashboardDesign/DashboardLayout'
import { Car, ArrowLeft, Clock, CheckCircle, XCircle, MapPin, Calendar, CreditCard } from 'lucide-react'
import { BookingApi } from '../../features/Api/BookingApi.ts'
import { useSelector } from 'react-redux'
import { skipToken } from '@reduxjs/toolkit/query'
import type { RootState } from '../../store/store'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router'
import PaymentPage  from './PaymentPage.tsx'
import { BookingReceipt } from '../../Componnents/User/Bookings/BookingReceipt.tsx'

const AllBookings: React.FC = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<'list' | 'payment' | 'receipt'>('list');
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    // Use BookingApi to fetch all bookings for the customer
    const { data: customerBookings, isLoading, error, refetch } = BookingApi.useGetBookingsByCustomerQuery(
        isAuthenticated && user ? user.user_id : skipToken
    );

    // RTK mutations from BookingApi
    const [cancelBooking] = BookingApi.useCancelBookingMutation();
    const [initiateBookingWithPayment] = BookingApi.useInitiateBookingWithPaymentMutation();

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

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
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
        return icons[vehicleType as keyof typeof icons] || '🚗';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    const handleCancelBooking = async (bookingId: number) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to cancel this booking?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#f44336",
            confirmButtonText: "Yes, Cancel it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await cancelBooking({ 
                        bookingId, 
                        cancellationReason: "Cancelled by customer" 
                    }).unwrap()
                    Swal.fire("Cancelled", "Your booking has been cancelled successfully", "success")
                    refetch();
                } catch (error) {
                    Swal.fire("Something went wrong", "Please Try Again", "error")
                }
            }
        })
    }

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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left font-semibold text-gray-700">Booking ID</th>
                                    <th className="text-left font-semibold text-gray-700">Vehicle</th>
                                    <th className="text-left font-semibold text-gray-700">Type</th>
                                    <th className="text-left font-semibold text-gray-700">Status</th>
                                    <th className="text-left font-semibold text-gray-700">Pickup Date</th>
                                    <th className="text-left font-semibold text-gray-700">Return Date</th>
                                    <th className="text-left font-semibold text-gray-700">Total</th>
                                    <th className="text-center font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerBookings.map((booking: any) => (
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
                                            <span className="flex items-center gap-1">
                                                {getVehicleTypeIcon(booking.vehicle_type)}
                                                {booking.vehicle_type?.charAt(0).toUpperCase() + booking.vehicle_type?.slice(1)}
                                            </span>
                                        </td>
                                        <td>{getStatusBadge(booking.booking_status)}</td>
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
                                            {booking.booking_status === 'pending' && (
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => handlePayNow(booking)}
                                                        className="btn bg-green-600 hover:bg-green-700 text-white btn-xs flex items-center gap-1"
                                                    >
                                                        <CreditCard size={12} />
                                                        Pay Now
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelBooking(booking.booking_id)}
                                                        className="btn btn-outline btn-error btn-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                            {booking.booking_status === 'completed' && (
                                                <button 
                                                    onClick={() => navigate('/vehicles')}
                                                    className="btn bg-blue-800 hover:bg-blue-900 text-white btn-xs"
                                                >
                                                    Book Again
                                                </button>
                                            )}
                                            {(booking.booking_status === 'confirmed' || booking.booking_status === 'active') && (
                                                <span className="text-xs text-green-600 flex items-center justify-center">
                                                    <CheckCircle size={12} className="mr-1" />
                                                    Active
                                                </span>
                                            )}
                                            {booking.booking_status === 'cancelled' && (
                                                <span className="text-xs text-red-500 flex items-center justify-center">
                                                    <XCircle size={12} className="mr-1" />
                                                    Cancelled
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default AllBookings;