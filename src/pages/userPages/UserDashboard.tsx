// components/UserDashboard.tsx
import React from 'react'
import DashboardLayout from '../../dashboardDesign/DashboardLayout'
import { Car, Calendar, DollarSign, Star, User, MapPin, Clock, TrendingUp } from 'lucide-react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import { CustomerDashboardApi } from '../../features/Api/CustomerDashboardAPI'
import type { 
    CustomerBooking, 
    UpcomingBooking, 
    VehicleRecommendation, 
    CustomerActivity 
} from '../../types/Types'

const UserDashboard: React.FC = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

    const { data: apiResponse, isLoading: dashboardLoading, error } = CustomerDashboardApi.useGetCustomerDashboardDataQuery(
        user?.user_id!,
        { skip: !isAuthenticated || !user?.user_id }
    )

    // Safe utility functions with error handling
    const getStatusColor = (status: string | undefined): string => {
        switch (status) {
            case 'Completed': return 'badge-success';
            case 'Active': return 'badge-info';
            case 'Confirmed': return 'badge-warning';
            case 'Pending': return 'badge-neutral';
            case 'Cancelled': return 'badge-error';
            default: return 'badge-neutral';
        }
    }

    const formatCurrency = (amount: number | undefined): string => {
        if (amount === undefined || amount === null) return '$0.00'
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }

    const formatDate = (dateString: string | undefined | null): string => {
        if (!dateString) return 'Date not available'
        
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'Invalid date'
            
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        } catch (error) {
            console.error('Error formatting date:', error)
            return 'Invalid date'
        }
    }

    const formatActivityDate = (dateString: string | undefined | null): string => {
        if (!dateString) return 'Date not available'
        
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'Invalid date'
            
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            console.error('Error formatting activity date:', error)
            return 'Invalid date'
        }
    }

    // Safe data access with proper defaults
    const dashboardData = apiResponse?.data

    const stats = dashboardData?.stats || {
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        upcomingBookings: 0,
        favoriteVehicleType: 'None'
    }

    const upcomingBookings: UpcomingBooking[] = dashboardData?.upcomingBookings || []
    const recentBookings: CustomerBooking[] = dashboardData?.recentBookings || []
    const recentActivity: CustomerActivity[] = dashboardData?.recentActivity || []
    const recommendations: VehicleRecommendation[] = dashboardData?.recommendations || []
    const loyaltyInfo = dashboardData?.loyaltyInfo || {
        loyalty_points: 0,
        points_earned_this_month: 0,
        next_reward_threshold: 500,
        reward_tier: 'Bronze'
    }

    // Safe value getters
    const getDisplayName = (): string => {
        return user?.username || user?.first_name || 'Valued Customer'
    }

    const getVehicleName = (booking: CustomerBooking): string => {
        return `${booking.make || 'Vehicle'} ${booking.model || ''}`.trim()
    }

    // Debug logging with safety
    React.useEffect(() => {
        if (apiResponse) {
            console.log('API Response:', apiResponse)
            console.log('Dashboard Data:', dashboardData)
            console.log('Stats:', stats)
            console.log('Recent Bookings Count:', recentBookings.length)
        }
        if (error) {
            console.error('Dashboard API Error:', error)
        }
    }, [apiResponse, dashboardData, stats, recentBookings.length, error])

    // Early return for loading state
    if (dashboardLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center min-h-96">
                    <div className="text-center">
                        <div className="loading loading-spinner loading-lg text-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading your dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    // Early return for authentication error
    if (!isAuthenticated || !user) {
        return (
            <DashboardLayout>
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-800 mb-4">Access Required</h2>
                    <p className="text-red-600 mb-4">Please sign in to view your dashboard.</p>
                    <Link to="/login" className="btn btn-primary">
                        Sign In
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    // Early return for API error
    if (error) {
        return (
            <DashboardLayout>
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-800 mb-4">Unable to Load Dashboard</h2>
                    <p className="text-red-600 mb-4">There was a problem loading your dashboard data.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="btn btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            {/* Welcome Header */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold">Welcome back, {getDisplayName()}! 👋</h1>
                    <p className="mt-2 text-blue-100">Here's your car rental journey with our service</p>
                </div>
            </div>

            {/* Debug info - remove in production
            {process.env.NODE_ENV === 'development' && apiResponse && (
                <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
                    <p className="text-sm font-medium text-yellow-800">Debug Information</p>
                    <p className="text-xs text-yellow-700">Total Bookings: {stats.totalBookings}</p>
                    <p className="text-xs text-yellow-700">Recent Bookings Count: {recentBookings.length}</p>
                    <p className="text-xs text-yellow-700">API Success: {apiResponse.success?.toString()}</p>
                </div>
            )} */}

            {/* User Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Bookings */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                            <p className="text-xs text-blue-600 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {stats.activeBookings} active
                            </p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-3">
                            <Calendar size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                            <p className="text-xs text-green-600">All time</p>
                        </div>
                        <div className="bg-green-100 rounded-full p-3">
                            <DollarSign size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Loyalty Points */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm font-medium">Loyalty Points</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.loyaltyPoints}</p>
                            <p className="text-xs text-purple-600">
                                {loyaltyInfo.reward_tier || 'Bronze'} Tier
                            </p>
                        </div>
                        <div className="bg-purple-100 rounded-full p-3">
                            <Star size={24} className="text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm font-medium">Upcoming Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings}</p>
                            <p className="text-xs text-orange-600">Scheduled rentals</p>
                        </div>
                        <div className="bg-orange-100 rounded-full p-3">
                            <Car size={24} className="text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Recent Bookings Section */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">My Recent Bookings</h2>
                        <Link to="/dashboard/my-bookings" className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none">
                            View All Bookings
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentBookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <Calendar size={48} className="text-gray-300 mb-4" />
                                <p className="text-gray-600 text-center mb-4">
                                    You have no recent bookings. Start exploring our vehicles!
                                </p>
                                <Link to="/vehicles" className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white">
                                    Browse Vehicles
                                </Link>
                            </div>
                        ) : (
                            recentBookings.slice(0, 5).map((booking) => (
                                <div 
                                    key={booking.booking_id} 
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {getVehicleName(booking)}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {formatDate(booking.pickup_date)} - {formatDate(booking.return_date)}
                                            </p>
                                            <div className="flex items-center mt-2 space-x-4">
                                                <span className={`badge ${getStatusColor(booking.booking_status)} text-white`}>
                                                    {booking.booking_status || 'Unknown'}
                                                </span>
                                                <span className="flex items-center text-sm text-gray-500">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    {booking.pickup_branch_name || 'Location not specified'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-700">
                                                {formatCurrency(booking.final_total)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {booking.registration_number || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions & Upcoming */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link to="/vehicles" className="w-full btn bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-start p-4">
                                <Car className="w-5 h-5 mr-3" />
                                Rent a Vehicle
                            </Link>
                            <Link to="/dashboard/my-bookings" className="w-full btn bg-green-600 hover:bg-green-700 text-white border-none flex items-center justify-start p-4">
                                <Calendar className="w-5 h-5 mr-3" />
                                My Bookings
                            </Link>
                            <Link to="/dashboard/loyalty" className="w-full btn bg-purple-600 hover:bg-purple-700 text-white border-none flex items-center justify-start p-4">
                                <Star className="w-5 h-5 mr-3" />
                                Loyalty Rewards
                            </Link>
                            <Link to="/dashboard/profile" className="w-full btn bg-orange-500 hover:bg-orange-600 text-white border-none flex items-center justify-start p-4">
                                <User className="w-5 h-5 mr-3" />
                                Profile Settings
                            </Link>
                        </div>
                    </div>

                    {/* Upcoming Bookings */}
                    {upcomingBookings.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Bookings</h2>
                            <div className="space-y-3">
                                {upcomingBookings.slice(0, 3).map((booking) => (
                                    <div key={booking.booking_id} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {booking.vehicle_name || 'Vehicle'}
                                                </p>
                                                <p className="text-xs text-gray-600 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {formatDate(booking.pickup_date)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-blue-700 text-sm">
                                                    {formatCurrency(booking.total_amount)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {booking.branch_name || 'Branch'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Vehicle Recommendations */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
                    <Link to="/vehicles" className="btn btn-outline border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                        Browse All Vehicles
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.length === 0 ? (
                        <div className="col-span-3 flex flex-col items-center justify-center py-10">
                            <Car size={48} className="text-gray-300 mb-4" />
                            <p className="text-gray-600 text-center">
                                No recommendations available yet. Start booking to get personalized suggestions!
                            </p>
                        </div>
                    ) : (
                        recommendations.map((vehicle) => (
                            <div 
                                key={vehicle.vehicle_id} 
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="text-center">
                                    <Car className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                        {vehicle.make} {vehicle.model}
                                    </h3>
                                    <p className="text-gray-600 text-xs mb-2">
                                        {vehicle.year} • {vehicle.vehicle_type}
                                    </p>
                                    <p className="text-blue-700 font-bold text-lg mb-2">
                                        {formatCurrency(vehicle.daily_rate)}/day
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3">
                                        {vehicle.recommended_reason}
                                    </p>
                                    <Link 
                                        to={`/vehicles/${vehicle.vehicle_id}`}
                                        className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white w-full"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                    <div className="space-y-3">
                        {recentActivity.slice(0, 5).map((activity) => (
                            <div key={activity.id} className="flex items-center p-3 border rounded-lg">
                                <div className={`w-2 h-2 rounded-full mr-3 ${
                                    activity.type === 'booking' ? 'bg-blue-500' : 'bg-green-500'
                                }`}></div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-sm">
                                        {activity.description || 'Activity'}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        {formatActivityDate(activity.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default UserDashboard