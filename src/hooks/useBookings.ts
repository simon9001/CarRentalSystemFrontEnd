// src/hooks/useBookings.ts
import { useState, useMemo } from 'react';
import { type BookingDetailsResponse } from '../types/booking';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

export const useBookings = (bookings: BookingDetailsResponse[] | undefined | null) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  const filteredBookings = useMemo(() => {
    // Ensure bookings is an array before calling filter
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    
    return safeBookings.filter(booking => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${booking.make} ${booking.model}`.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRange.start && dateRange.end) {
        const pickupDate = new Date(booking.pickup_date);
        const returnDate = new Date(booking.return_date);
        matchesDateRange = pickupDate >= dateRange.start && returnDate <= dateRange.end;
      }

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [bookings, searchTerm, statusFilter, dateRange]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    filteredBookings
  };
};