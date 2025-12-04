// src/components/admin/bookings/BookingCharts.tsx
import React from 'react';
import { type BookingDetailsResponse, type BookingStatistics } from '../../../types/booking';

interface BookingChartsProps {
  statistics?: BookingStatistics | null;
  bookings: BookingDetailsResponse[];
}

const BookingCharts: React.FC<BookingChartsProps> = ({ statistics, bookings }) => {
  // Provide default values if statistics is undefined/null
  const defaultStats = {
    status_counts: {
      pending: 0,
      confirmed: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0
    },
    total_bookings: 0,
    total_revenue: 0,
    average_booking_value: 0,
    unique_customers: 0,
    active_bookings: 0,
    upcoming_bookings: 0,
    recent_bookings: 0
  };

  const safeStats = statistics && typeof statistics === 'object' && 
                   statistics.status_counts && typeof statistics.status_counts === 'object'
    ? statistics 
    : defaultStats;

  const safeStatusCounts = safeStats.status_counts || defaultStats.status_counts;

  const statusData = [
    { status: 'Pending', count: safeStatusCounts.pending, color: 'bg-yellow-500' },
    { status: 'Confirmed', count: safeStatusCounts.confirmed, color: 'bg-blue-500' },
    { status: 'Active', count: safeStatusCounts.active, color: 'bg-green-500' },
    { status: 'Completed', count: safeStatusCounts.completed, color: 'bg-gray-500' },
    { status: 'Cancelled', count: safeStatusCounts.cancelled, color: 'bg-red-500' }
  ];

  const totalBookings = statusData.reduce((sum, item) => sum + item.count, 0);

  // Monthly revenue data (simplified) - use actual data if available
  const monthlyRevenue = [
    { month: 'Jan', revenue: 4500 },
    { month: 'Feb', revenue: 5200 },
    { month: 'Mar', revenue: 4800 },
    { month: 'Apr', revenue: 6100 },
    { month: 'May', revenue: 5800 },
    { month: 'Jun', revenue: safeStats.total_revenue || 0 } // Use actual revenue if available
  ];

  const maxRevenue = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map(m => m.revenue)) : 0;

  // If there's no data to show
  if (totalBookings === 0 && bookings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <p className="text-gray-500">No chart data available</p>
          <p className="text-sm text-gray-400 mt-1">Create some bookings to see statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Distribution Pie Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Status Distribution</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            {statusData.map((item, index) => (
              <div key={item.status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm text-gray-600">{item.status}</span>
                <span className="text-sm font-medium ml-auto">
                  {item.count} ({totalBookings > 0 ? Math.round((item.count / totalBookings) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
          {totalBookings > 0 ? (
            <div className="relative w-24 h-24">
              {/* Simple pie chart using conic gradients */}
              <div 
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(
                    ${statusData.map((item, index) => 
                      `${item.color.replace('bg-', '')} ${index === 0 ? 0 : 
                      statusData.slice(0, index).reduce((sum, d) => sum + (d.count / totalBookings) * 360, 0)}deg ${ 
                      statusData.slice(0, index + 1).reduce((sum, d) => sum + (d.count / totalBookings) * 360, 0)}deg`
                    ).join(', ')}
                  )`
                }}
              ></div>
            </div>
          ) : (
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="w-full h-full rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-400">No data</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Revenue Bar Chart */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Revenue Trend</h4>
        {maxRevenue > 0 ? (
          <div className="flex items-end gap-2 h-32">
            {monthlyRevenue.map((month, index) => (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  style={{ 
                    height: maxRevenue > 0 ? `${(month.revenue / maxRevenue) * 80}%` : '0%',
                    minHeight: '4px' // Ensure minimum height for visibility
                  }}
                  title={`$${month.revenue.toLocaleString()}`}
                ></div>
                <span className="text-xs text-gray-500 mt-1">{month.month}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-400">No revenue data available</p>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Current Revenue: ${safeStats.total_revenue?.toLocaleString() || 0}</span>
          <span>Avg: ${safeStats.average_booking_value?.toFixed(0) || 0}/booking</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCharts;