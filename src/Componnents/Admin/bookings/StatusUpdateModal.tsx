// src/components/admin/bookings/StatusUpdateModal.tsx
import React, { useState } from 'react';
import {type BookingDetailsResponse } from '../../../types/booking';
import { BookingApi } from '../../../features/Api/BookingApi';
import BookingStatusBadge from './BookingStatusBadge';
import Swal from 'sweetalert2';

interface StatusUpdateModalProps {
  booking: BookingDetailsResponse;
  onClose: () => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ booking, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState(booking.booking_status);
  const [updateStatus, { isLoading }] = BookingApi.useUpdateBookingStatusMutation();

  const statusOptions = [
    { value: 'Pending', label: 'Pending', description: 'Booking is awaiting confirmation' },
    { value: 'Confirmed', label: 'Confirmed', description: 'Booking is confirmed and ready for pickup' },
    { value: 'Active', label: 'Active', description: 'Vehicle is currently with customer' },
    { value: 'Completed', label: 'Completed', description: 'Vehicle has been returned' },
    { value: 'Cancelled', label: 'Cancelled', description: 'Booking has been cancelled' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateStatus({
        bookingId: booking.booking_id,
        bookingStatus: selectedStatus
      }).unwrap();

      Swal.fire('Success!', `Booking status updated to ${selectedStatus}`, 'success');
      onClose();
    } catch (error) {
      Swal.fire('Error!', 'Failed to update booking status', 'error');
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Update Booking Status</h3>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Current Status:</p>
          <BookingStatusBadge status={booking.booking_status} size="lg" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control w-full mb-6">
            <label className="label">
              <span className="label-text">Select New Status</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select select-bordered w-full"
              required
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {selectedStatus && (
            <div className="alert alert-info mb-6">
              <div>
                <span className="text-sm">
                  {statusOptions.find(opt => opt.value === selectedStatus)?.description}
                </span>
              </div>
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || selectedStatus === booking.booking_status}
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;