// src/components/admin/bookings/CancelBookingModal.tsx
import React, { useState } from 'react';
import { type BookingDetailsResponse } from '../../../types/booking';
import { BookingApi } from '../../../features/Api/BookingApi';
import Swal from 'sweetalert2';

interface CancelBookingModalProps {
  booking: BookingDetailsResponse;
  onClose: () => void;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({ booking, onClose }) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelBooking, { isLoading }] = BookingApi.useCancelBookingMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cancellationReason.trim()) {
      Swal.fire('Warning!', 'Please provide a cancellation reason', 'warning');
      return;
    }

    try {
      await cancelBooking({
        bookingId: booking.booking_id,
        cancellationReason: cancellationReason
      }).unwrap();

      Swal.fire('Success!', 'Booking has been cancelled', 'success');
      onClose();
    } catch (error) {
      Swal.fire('Error!', 'Failed to cancel booking', 'error');
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4 text-red-600">Cancel Booking</h3>
        
        <div className="alert alert-warning mb-6">
          <div>
            <span className="font-medium">Warning:</span> This action cannot be undone. 
            The booking will be marked as cancelled and the vehicle will become available for other bookings.
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Booking Details:</p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p><strong>Booking ID:</strong> #{booking.booking_id}</p>
            <p><strong>Customer:</strong> {booking.customer_name || booking.customer_email}</p>
            <p><strong>Vehicle:</strong> {booking.make} {booking.model}</p>
            <p><strong>Total Amount:</strong> ${booking.final_total}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control w-full mb-6">
            <label className="label">
              <span className="label-text">Cancellation Reason *</span>
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="textarea textarea-bordered h-24"
              placeholder="Please provide the reason for cancellation..."
              required
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Keep Booking
            </button>
            <button
              type="submit"
              className="btn btn-error"
              disabled={isLoading || !cancellationReason.trim()}
            >
              {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelBookingModal;