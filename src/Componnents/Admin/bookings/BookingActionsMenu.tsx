// src/components/admin/bookings/BookingActionsMenu.tsx
import React, { useState } from 'react';
import { type BookingDetailsResponse } from '../../../types/booking';
import { MoreVertical, Eye, Edit, XCircle, Calendar, DollarSign } from 'lucide-react';

interface BookingActionsMenuProps {
  booking: BookingDetailsResponse;
  onView: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onStatusUpdate?: () => void;
  onTotalsUpdate?: () => void;
}

const BookingActionsMenu: React.FC<BookingActionsMenuProps> = ({
  booking,
  onView,
  onEdit,
  onCancel,
  onStatusUpdate,
  onTotalsUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: onView,
      available: true
    },
    {
      label: 'Update Status',
      icon: Calendar,
      onClick: onStatusUpdate,
      available: booking.booking_status !== 'Cancelled' && booking.booking_status !== 'Completed'
    },
    {
      label: 'Update Totals',
      icon: DollarSign,
      onClick: onTotalsUpdate,
      available: booking.booking_status !== 'Cancelled'
    },
    {
      label: 'Cancel Booking',
      icon: XCircle,
      onClick: onCancel,
      available: booking.booking_status !== 'Cancelled' && booking.booking_status !== 'Completed',
      destructive: true
    }
  ].filter(action => action.available);

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-sm btn-circle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical size={16} />
      </button>
      
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50"
      >
        {actions.map((action, index) => (
          <li key={index}>
            <button
              onClick={() => {
                action.onClick?.();
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 ${action.destructive ? 'text-red-600 hover:bg-red-50' : ''}`}
            >
              <action.icon size={16} />
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingActionsMenu;