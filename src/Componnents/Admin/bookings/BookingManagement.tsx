// src/components/admin/bookings/BookingManagement.tsx
import React, { useState } from 'react';
import AdminDashboardLayout from '../../../dashboardDesign/AdminDashboardLayout';
import { 
  Calendar, 
  Plus, 
  BarChart3, 
  List, 
  Car, 
  Clock,
  AlertTriangle
} from 'lucide-react';
import { BookingApi } from '../../../features/Api/BookingApi';
import BookingDashboard from './BookingDashboard';
import AllBookingsTable from './AllBookingsTable';
import BookingDetails from './BookingDetails';
import CreateBookingForm from './CreateBookingForm';
import TodaysPickups from './TodaysPickups';
import TodaysReturns from './TodaysReturns';
import OverdueReturns from './OverdueReturns';

type ActiveView = 
  | 'dashboard' 
  | 'all' 
  | 'create' 
  | 'today-pickups' 
  | 'today-returns' 
  | 'overdue' 
  | 'details';

const BookingManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // RTK Query hooks - FIXED: Added proper arguments
  const { data: bookings, isLoading, error } = BookingApi.useGetAllBookingsQuery(undefined);
  const { data: statistics } = BookingApi.useGetBookingStatisticsQuery(undefined);
  const { data: todaysPickups } = BookingApi.useGetTodaysPickupsQuery(undefined);
  const { data: todaysReturns } = BookingApi.useGetTodaysReturnsQuery(undefined);
  const { data: overdueReturns } = BookingApi.useGetOverdueReturnsQuery(undefined);

  const handleViewBooking = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setActiveView('details');
  };

  const handleBackToList = () => {
    setActiveView('all');
    setSelectedBookingId(null);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <BookingDashboard 
            statistics={statistics}
            bookings={bookings || []}
            onViewBooking={handleViewBooking}
          />
        );
      
      case 'all':
        return (
          <AllBookingsTable 
            bookings={bookings || []}
            isLoading={isLoading}
            error={error}
            onViewBooking={handleViewBooking}
          />
        );
      
      case 'create':
        return <CreateBookingForm onSuccess={() => setActiveView('all')} />;
      
      case 'today-pickups':
        return (
          <TodaysPickups 
            pickups={todaysPickups || []}
            onViewBooking={handleViewBooking}
          />
        );
      
      case 'today-returns':
        return (
          <TodaysReturns 
            returns={todaysReturns || []}
            onViewBooking={handleViewBooking}
          />
        );
      
      case 'overdue':
        return (
          <OverdueReturns 
            overdue={overdueReturns || []}
            onViewBooking={handleViewBooking}
          />
        );
      
      case 'details':
        return selectedBookingId ? (
          <BookingDetails 
            bookingId={selectedBookingId}
            onBack={handleBackToList}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <AdminDashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Booking Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage all rental bookings and reservations</p>
          </div>
        </div>
        
        <button
          onClick={() => setActiveView('create')}
          className="btn btn-primary gap-2 w-full sm:w-auto"
        >
          <Plus size={20} />
          New Booking
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex min-w-max sm:min-w-0">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                activeView === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </button>
            
            <button
              onClick={() => setActiveView('all')}
              className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                activeView === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">All Bookings</span>
              <span className="sm:hidden">All</span>
            </button>
            
            <button
              onClick={() => setActiveView('today-pickups')}
              className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                activeView === 'today-pickups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Car size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Today's Pickups</span>
              <span className="sm:hidden">Pickups</span>
              {todaysPickups && todaysPickups.length > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                  {todaysPickups.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveView('today-returns')}
              className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                activeView === 'today-returns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Today's Returns</span>
              <span className="sm:hidden">Returns</span>
              {todaysReturns && todaysReturns.length > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                  {todaysReturns.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveView('overdue')}
              className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                activeView === 'overdue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertTriangle size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Overdue Returns</span>
              <span className="sm:hidden">Overdue</span>
              {overdueReturns && overdueReturns.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                  {overdueReturns.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-96">
        {renderActiveView()}
      </div>
    </AdminDashboardLayout>
  );
};

export default BookingManagement;