// src/components/admin/bookings/BookingDetails.tsx
import React, { useState } from 'react';
import { BookingApi } from '../../../features/Api/BookingApi';
import BookingStatusBadge from './BookingStatusBadge';
import CustomerInfoCard from './CustomerInfoCard';
import VehicleInfoCard from './VehicleInfoCard';
import StatusUpdateModal from './StatusUpdateModal';
import TotalsUpdateModal from './TotalsUpdateModal';
import CancelBookingModal from './CancelBookingModal';
import { ArrowLeft, Edit, Calendar, DollarSign, XCircle } from 'lucide-react';

interface BookingDetailsProps {
  bookingId: number;
  onBack: () => void;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ bookingId, onBack }) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTotalsModal, setShowTotalsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: booking, isLoading, error } = BookingApi.useGetBookingByIdQuery(bookingId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="alert alert-error">
        <span>Error loading booking details</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn btn-ghost btn-circle">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Booking #{booking.booking_id}
            </h2>
            <p className="text-gray-600">
              Created {new Date(booking.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn btn-outline gap-2"
          >
            <Calendar size={16} />
            Update Status
          </button>
          <button
            onClick={() => setShowTotalsModal(true)}
            className="btn btn-outline gap-2"
          >
            <DollarSign size={16} />
            Update Totals
          </button>
          {booking.booking_status !== 'Cancelled' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn btn-error gap-2"
            >
              <XCircle size={16} />
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Status:</span>
        <BookingStatusBadge status={booking.booking_status} size="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Vehicle Info */}
        <div className="lg:col-span-1 space-y-6">
          <CustomerInfoCard booking={booking} />
          <VehicleInfoCard booking={booking} />
        </div>

        {/* Right Column - Booking Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Timeline</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pickup Date</span>
                <span className="text-sm">
                  {new Date(booking.pickup_date).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Return Date</span>
                <span className="text-sm">
                  {new Date(booking.return_date).toLocaleString()}
                </span>
              </div>
              {booking.actual_return_date && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Actual Return</span>
                  <span className="text-sm">
                    {new Date(booking.actual_return_date).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Daily Rate</span>
                <span>${booking.rate_per_day}</span>
              </div>
              <div className="flex justify-between">
                <span>Calculated Total</span>
                <span>${booking.calculated_total}</span>
              </div>
              {booking.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${booking.discount_amount}</span>
                </div>
              )}
              {booking.extra_charges > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Extra Charges</span>
                  <span>+${booking.extra_charges}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-3 font-bold">
                <span>Final Total</span>
                <span>${booking.final_total}</span>
              </div>
            </div>
          </div>

          {/* Branch Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Pickup Location</h4>
                <p className="text-sm">{booking.pickup_branch_name || 'N/A'}</p>
                <p className="text-sm text-gray-500">{booking.pickup_city || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Return Location</h4>
                <p className="text-sm">{booking.return_branch_name || 'N/A'}</p>
                <p className="text-sm text-gray-500">{booking.return_city || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showStatusModal && (
        <StatusUpdateModal
          booking={booking}
          onClose={() => setShowStatusModal(false)}
        />
      )}

      {showTotalsModal && (
        <TotalsUpdateModal
          booking={booking}
          onClose={() => setShowTotalsModal(false)}
        />
      )}

      {showCancelModal && (
        <CancelBookingModal
          booking={booking}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
};

export default BookingDetails;