// src/components/admin/bookings/BookingSummaryCards.tsx
import React from 'react';
import { type BookingStatistics } from '../../../features/Api/BookingApi';
import { Calendar, Users, DollarSign, Car, Clock, AlertTriangle } from 'lucide-react';

interface BookingSummaryCardsProps {
  statistics: BookingStatistics | null | undefined;
  isError?: boolean;
  isLoading?: boolean; // Add loading prop
}

const BookingSummaryCards: React.FC<BookingSummaryCardsProps> = ({ 
  statistics, 
  isError = false,
  isLoading = false 
}) => {
  // Always provide default values - more robust approach
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

  // Use statistics if it exists and is valid, otherwise use default
  const safeStats = statistics && typeof statistics === 'object' && 
                   statistics.status_counts && typeof statistics.status_counts === 'object'
    ? statistics 
    : defaultStats;

  // Ensure status_counts exists with all required properties
  const safeStatusCounts = safeStats.status_counts || defaultStats.status_counts;

  const cards = [
    {
      title: 'Total Bookings',
      value: safeStats.total_bookings || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Now',
      value: safeStats.active_bookings || 0,
      icon: Car,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Upcoming',
      value: safeStats.upcoming_bookings || 0,
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Total Revenue',
      value: `$${(safeStats.total_revenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Unique Customers',
      value: safeStats.unique_customers || 0,
      icon: Users,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Overdue',
      value: safeStatusCounts.overdue || 0, // Use safeStatusCounts
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  // Show loading skeleton if isLoading is true
  if (isLoading) {
    return (
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
    );
  }

  // Show error state if isError is true
  if (isError) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 border-red-200 bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Error</p>
                </div>
                <div className={`p-3 rounded-full ${card.color} bg-opacity-10`}>
                  <Icon size={24} className={card.textColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.color} bg-opacity-10`}>
                <Icon size={24} className={card.textColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookingSummaryCards;