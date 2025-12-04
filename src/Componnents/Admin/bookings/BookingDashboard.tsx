// src/components/admin/bookings/BookingDashboard.tsx
import React from 'react';
import { type BookingStatistics } from '../../../features/Api/BookingApi';
import { type BookingDetailsResponse } from '../../../types/booking';
import BookingSummaryCards from './BookingSummaryCards';
import BookingCharts from './BookingCharts';

interface BookingDashboardProps {
  statistics?: BookingStatistics | null;
  bookings: BookingDetailsResponse[] | undefined | null;
  onViewBooking: (bookingId: number) => void;
  isLoading?: boolean;
  isError?: boolean;
}

const BookingDashboard: React.FC<BookingDashboardProps> = ({
  statistics,
  bookings,
  onViewBooking,
  isLoading = false,
  isError = false
}) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="p-3 rounded-full bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-600">
            Unable to load booking statistics and data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Safely handle undefined/null bookings with proper type checking
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const recentBookings = safeBookings.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Statistics - Always render but pass null/undefined safely */}
      <BookingSummaryCards statistics={statistics || undefined} />

      {/* Charts and Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Booking Status Distribution
          </h3>
          <BookingCharts 
            statistics={statistics || undefined} 
            bookings={safeBookings} 
          />
        </div>
        
        {/* Recent Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Bookings
            </h3>
            {recentBookings.length > 0 && (
              <span className="text-sm text-gray-500">
                Showing {recentBookings.length} of {safeBookings.length}
              </span>
            )}
          </div>
          
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <p className="text-gray-500">No recent bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentBookings.map(booking => (
                    <tr 
                      key={booking.booking_id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onViewBooking(booking.booking_id)}
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">#{booking.booking_id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {booking.customer_name || 'Guest User'}
                          </span>
                          <span className="text-xs text-gray-500 truncate max-w-[180px]">
                            {booking.customer_email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {booking.make} {booking.model}
                          </span>
                          <span className="text-xs text-gray-500">
                            {booking.registration_number}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.booking_status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : booking.booking_status === 'Active' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.booking_status === 'Confirmed' 
                            ? 'bg-blue-100 text-blue-800'
                            : booking.booking_status === 'Pending' 
                            ? 'bg-gray-100 text-gray-800'
                            : booking.booking_status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : booking.booking_status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.booking_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          ${booking.final_total.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {safeBookings.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button 
                onClick={() => onViewBooking(0)} // Pass 0 or handle "View All" differently
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all bookings →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDashboard;