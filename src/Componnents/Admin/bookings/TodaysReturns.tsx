// src/components/admin/bookings/TodaysReturns.tsx
import React from 'react';
import { type BookingDetailsResponse } from '../../../types/booking';
import { BookingApi } from '../../../features/Api/BookingApi';
import BookingStatusBadge from './BookingStatusBadge';
import { Car, Clock, User, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

interface TodaysReturnsProps {
  returns: BookingDetailsResponse[] | undefined | null;
  onViewBooking: (bookingId: number) => void;
  isLoading?: boolean;
  isError?: boolean;
}

const TodaysReturns: React.FC<TodaysReturnsProps> = ({ 
  returns, 
  onViewBooking,
  isLoading = false,
  isError = false 
}) => {
  const [updateActualReturnDate] = BookingApi.useUpdateActualReturnDateMutation();

  const handleMarkReturned = async (bookingId: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      await updateActualReturnDate({
        bookingId,
        actualReturnDate: today
      }).unwrap();

      Swal.fire('Success!', 'Vehicle marked as returned. Booking completed.', 'success');
    } catch (error) {
      Swal.fire('Error!', 'Failed to mark vehicle as returned', 'error');
    }
  };

  const getReturnStatus = (returnDate: string) => {
    const now = new Date();
    const return_ = new Date(returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const returnDay = new Date(return_);
    returnDay.setHours(0, 0, 0, 0);

    if (returnDay.getTime() < today.getTime()) {
      return { status: 'overdue', text: 'Overdue', color: 'text-red-600', icon: AlertTriangle };
    }
    if (returnDay.getTime() === today.getTime()) {
      return { status: 'due-today', text: 'Due Today', color: 'text-orange-600', icon: Clock };
    }
    return { status: 'on-time', text: 'On Time', color: 'text-green-600', icon: CheckCircle };
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading today's returns...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Error Loading Returns
            </h3>
            <p className="text-gray-600">
              Failed to load today's returns. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Ensure returns is an array
  const safeReturns = Array.isArray(returns) ? returns : [];

  if (safeReturns.length === 0) {
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
              No Returns Today
            </h3>
            <p className="text-gray-600">
              No returns are scheduled for today.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeReturns.map(booking => {
          const returnStatus = getReturnStatus(booking.return_date);
          const StatusIcon = returnStatus.icon;

          return (
            <div key={booking.booking_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    #{booking.booking_id}
                  </h3>
                  <BookingStatusBadge status={booking.booking_status} size="sm" />
                </div>
                <div className="flex items-center gap-1">
                  <StatusIcon size={14} className={returnStatus.color} />
                  <span className={`text-sm font-medium ${returnStatus.color}`}>
                    {returnStatus.text}
                  </span>
                </div>
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
                  <span className="text-sm truncate">{booking.return_branch_name || 'Location not specified'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-sm">
                    Due: {booking.return_date ? new Date(booking.return_date).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'Time not specified'}
                  </span>
                </div>

                {booking.actual_return_date && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={14} />
                    <span className="text-sm truncate">
                      Returned: {booking.actual_return_date ? new Date(booking.actual_return_date).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onViewBooking(booking.booking_id)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  View Details
                </button>
                
                {!booking.actual_return_date && (
                  <button
                    onClick={() => handleMarkReturned(booking.booking_id)}
                    className="flex-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Mark Returned
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

export default TodaysReturns;