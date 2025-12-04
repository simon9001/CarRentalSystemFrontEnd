// src/components/admin/bookings/OverdueReturns.tsx
import React from 'react';
import { type BookingDetailsResponse } from '../../../types/booking';
import { BookingApi } from '../../../features/Api/BookingApi';
import BookingStatusBadge from './BookingStatusBadge';
import { Car, Clock, User, MapPin, AlertTriangle, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';

interface OverdueReturnsProps {
  overdue: BookingDetailsResponse[] | undefined | null;
  onViewBooking: (bookingId: number) => void;
  isLoading?: boolean;
  isError?: boolean;
}

const OverdueReturns: React.FC<OverdueReturnsProps> = ({ 
  overdue, 
  onViewBooking,
  isLoading = false,
  isError = false 
}) => {
  const [updateActualReturnDate] = BookingApi.useUpdateActualReturnDateMutation();
  const [updateTotals] = BookingApi.useUpdateBookingTotalsMutation();

  const handleMarkReturned = async (bookingId: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      await updateActualReturnDate({
        bookingId,
        actualReturnDate: today
      }).unwrap();

      Swal.fire('Success!', 'Vehicle marked as returned.', 'success');
    } catch (error) {
      Swal.fire('Error!', 'Failed to mark vehicle as returned', 'error');
    }
  };

  const handleAddLateFee = async (booking: BookingDetailsResponse) => {
    const { value: lateFee } = await Swal.fire({
      title: 'Add Late Fee',
      input: 'number',
      inputLabel: 'Late Fee Amount',
      inputPlaceholder: 'Enter late fee amount',
      inputValue: '50',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || parseFloat(value) <= 0) {
          return 'Please enter a valid amount';
        }
      }
    });

    if (lateFee) {
      try {
        const newExtraCharges = (booking.extra_charges || 0) + parseFloat(lateFee);
        const newFinalTotal = (booking.final_total || 0) + parseFloat(lateFee);

        await updateTotals({
          bookingId: booking.booking_id,
          calculatedTotal: booking.calculated_total || 0,
          discountAmount: booking.discount_amount || 0,
          finalTotal: newFinalTotal,
          extraCharges: newExtraCharges
        }).unwrap();

        Swal.fire('Success!', `Late fee of $${lateFee} added to booking.`, 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to add late fee', 'error');
      }
    }
  };

  const calculateDaysOverdue = (returnDate: string) => {
    const return_ = new Date(returnDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - return_.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading overdue returns...</p>
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
              Error Loading Overdue Returns
            </h3>
            <p className="text-gray-600">
              Failed to load overdue returns. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Ensure overdue is an array
  const safeOverdue = Array.isArray(overdue) ? overdue : [];

  if (safeOverdue.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="text-green-500">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No Overdue Returns
            </h3>
            <p className="text-gray-600">
              Great job! All vehicles have been returned on time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <span className="font-medium text-yellow-800">
              {safeOverdue.length} overdue return(s) need attention
            </span>
            <p className="text-sm text-yellow-700 mt-1">
              These vehicles are past their return date and require immediate action.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeOverdue.map(booking => {
          const daysOverdue = calculateDaysOverdue(booking.return_date);
          const suggestedLateFee = Math.min(50 * daysOverdue, 200); // Cap at $200

          return (
            <div key={booking.booking_id} className="bg-white rounded-lg shadow-sm border border-red-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    #{booking.booking_id}
                  </h3>
                  <BookingStatusBadge status={booking.booking_status} size="sm" />
                </div>
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle size={14} />
                  <span className="text-sm font-medium">
                    {daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue
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
                  <Clock size={14} className="text-red-400" />
                  <span className="text-sm text-red-600">
                    Was due: {booking.return_date ? new Date(booking.return_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-gray-400" />
                  <span className="text-sm">
                    Current total: ${(booking.final_total || 0).toLocaleString()}
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
                
                <div className="flex flex-col gap-1 flex-1">
                  <button
                    onClick={() => handleMarkReturned(booking.booking_id)}
                    className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Mark Returned
                  </button>
                  <button
                    onClick={() => handleAddLateFee(booking)}
                    className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    Add Late Fee
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OverdueReturns;