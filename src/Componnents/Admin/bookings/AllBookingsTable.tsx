// src/components/admin/bookings/AllBookingsTable.tsx
import React, { useState } from 'react';
import { type BookingDetailsResponse } from '../../../types/booking';
import { useBookings } from '../../../hooks/useBookings';
import BookingStatusBadge from './BookingStatusBadge';
import BookingActionsMenu from './BookingActionsMenu';
import DateRangeFilter from './DateRangeFilter';
import { Search, Filter, Download, AlertCircle, Loader2 } from 'lucide-react';

interface AllBookingsTableProps {
  bookings: BookingDetailsResponse[] | undefined | null;
  isLoading: boolean;
  error: any;
  onViewBooking: (bookingId: number) => void;
}

const AllBookingsTable: React.FC<AllBookingsTableProps> = ({
  bookings,
  isLoading,
  error,
  onViewBooking
}) => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    filteredBookings
  } = useBookings(bookings);

  const [showFilters, setShowFilters] = useState(false);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Bookings
            </h3>
            <p className="text-gray-600">
              {error.message || 'Failed to load bookings. Please try again.'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty bookings
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Booking ID',
      'Customer',
      'Email',
      'Vehicle',
      'Pickup Date',
      'Return Date',
      'Status',
      'Total Amount'
    ].join(',');

    const csvData = filteredBookings.map(booking => [
      booking.booking_id,
      `"${booking.customer_name || 'N/A'}"`,
      booking.customer_email || 'N/A',
      `"${booking.make || ''} ${booking.model || ''} (${booking.registration_number || 'N/A'})"`,
      booking.pickup_date || 'N/A',
      booking.return_date || 'N/A',
      booking.booking_status || 'N/A',
      booking.final_total || 0
    ].join(','));

    const csv = [headers, ...csvData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header with Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Overdue">Overdue</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-md flex items-center gap-2 ${
                showFilters 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            disabled={filteredBookings.length === 0}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* Date Range Filter */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium mb-1">
                      {safeBookings.length === 0 ? 'No bookings found' : 'No matching bookings'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {safeBookings.length === 0 
                        ? 'Create your first booking to get started' 
                        : 'Try adjusting your search or filters'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map(booking => (
                <tr 
                  key={booking.booking_id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onViewBooking(booking.booking_id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-gray-900">#{booking.booking_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {booking.customer_name || 'Guest User'}
                      </span>
                      <span className="text-sm text-gray-500 truncate max-w-[180px]">
                        {booking.customer_email || 'N/A'}
                      </span>
                      {booking.customer_phone && (
                        <span className="text-xs text-gray-400">
                          {booking.customer_phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {booking.make} {booking.model}
                      </span>
                      <span className="text-sm text-gray-500">
                        {booking.registration_number}
                      </span>
                      <span className="text-xs text-gray-400">
                        {booking.vehicle_type || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">
                        {booking.pickup_date ? new Date(booking.pickup_date).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {booking.pickup_branch_name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">
                        {booking.return_date ? new Date(booking.return_date).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {booking.return_branch_name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <BookingStatusBadge status={booking.booking_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      ${(booking.final_total || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div onClick={(e) => e.stopPropagation()}>
                      <BookingActionsMenu
                        booking={booking}
                        onView={() => onViewBooking(booking.booking_id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredBookings.length} of {safeBookings.length} bookings
        </div>
        <div className="text-sm text-gray-500">
          {filteredBookings.length > 0 && 'Click on a row to view details'}
        </div>
      </div>
    </div>
  );
};

export default AllBookingsTable;