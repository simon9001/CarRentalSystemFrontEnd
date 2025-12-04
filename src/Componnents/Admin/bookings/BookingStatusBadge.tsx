// src/components/admin/bookings/BookingStatusBadge.tsx
import React from 'react';

interface BookingStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pending':
        return { color: 'badge-warning', text: 'Pending' };
      case 'Confirmed':
        return { color: 'badge-info', text: 'Confirmed' };
      case 'Active':
        return { color: 'badge-primary', text: 'Active' };
      case 'Completed':
        return { color: 'badge-success', text: 'Completed' };
      case 'Cancelled':
        return { color: 'badge-error', text: 'Cancelled' };
      case 'Overdue':
        return { color: 'badge-error', text: 'Overdue' };
      default:
        return { color: 'badge-neutral', text: status };
    }
  };

  const { color, text } = getStatusConfig(status);
  const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : '';

  return (
    <span className={`badge ${color} ${sizeClass}`}>
      {text}
    </span>
  );
};

export default BookingStatusBadge;