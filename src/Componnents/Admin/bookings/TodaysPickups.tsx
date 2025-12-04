// src/components/admin/bookings/TodaysPickups.tsx
import React from 'react';
import { type BookingDetailsResponse } from '../../../types/booking';
import { BookingApi } from '../../../features/Api/BookingApi';
import BookingStatusBadge from './BookingStatusBadge';
import { Car, Clock, User, MapPin, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface TodaysPickupsProps {
  pickups: BookingDetailsResponse[] | undefined | null;
  onViewBooking: (bookingId: number) => void;
  isLoading?: boolean;
  isError?: boolean;
}

const TodaysPickups: React.FC<TodaysPickupsProps> = ({ 
  pickups, 
  onViewBooking,
  isLoading = false,
  isError = false 
}) => {
  const [updateStatus] = BookingApi.useUpdateBookingStatusMutation();

  const handleConfirmPickup = async (bookingId: number) => {
    try {
      await updateStatus({
        bookingId,
        bookingStatus: 'Active'
      }).unwrap();

      Swal.fire('Success!', 'Pickup confirmed. Booking is now active.', 'success');
    } catch (error) {
      Swal.fire('Error!', 'Failed to confirm pickup', 'error');
    }
  };

  const getTimeStatus = (pickupDate: string) => {
    const now = new Date();
    const pickup = new Date(pickupDate);
    const diffHours = (pickup.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) return { status: 'overdue', text: 'Overdue', color: 'text-red-600' };
    if (diffHours < 1) return { status: 'urgent', text: 'Within 1 hour', color: 'text-orange-600' };
    if (diffHours < 3) return { status: 'soon', text: 'Within 3 hours', color: 'text-yellow-600' };
    return { status: 'scheduled', text: 'Scheduled', color: 'text-green-600' };
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading today's pickups...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Error Loading Pickups
            </h3>
            <p className="text-gray-600">
              Failed to load today's pickups. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Ensure pickups is an array
  const safePickups = Array.isArray(pickups) ? pickups : [];

  if (safePickups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No Pickups Today
            </h3>
            <p className="text-gray-600">
              No pickups are scheduled for today.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safePickups.map(booking => {
          const timeStatus = getTimeStatus(booking.pickup_date);

          return (
            <div key={booking.booking_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    #{booking.booking_id}
                  </h3>
                  <BookingStatusBadge status={booking.booking_status} size="sm" />
                </div>
                <span className={`text-sm font-medium ${timeStatus.color}`}>
                  {timeStatus.text}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-sm truncate">{booking.customer_name || booking.customer_email || 'N/A'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Car size={14} className="text-gray-400" />
                  <span className="text-sm truncate">
                    {booking.make} {booking.model} ({booking.registration_number || 'N/A'})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-sm truncate">{booking.pickup_branch_name || 'Location not specified'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-sm">
                    {booking.pickup_date ? new Date(booking.pickup_date).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'Time not specified'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onViewBooking(booking.booking_id)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  View Details
                </button>
                
                {booking.booking_status === 'Confirmed' && (
                  <button
                    onClick={() => handleConfirmPickup(booking.booking_id)}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Confirm Pickup
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodaysPickups;