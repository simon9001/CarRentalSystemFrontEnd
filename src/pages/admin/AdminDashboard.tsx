// components/AdminDashboard.tsx
import React from 'react'
import type { BookingStatus } from '../../types/Types'
import AdminDashboardLayout from '../../dashboardDesign/AdminDashboardLayout'
import { Car, Users, Calendar, DollarSign, Wrench, Clipboard, AlertTriangle, TrendingUp, Building, Shield } from 'lucide-react'
import { DashboardApi } from '../../features/Api/dashboardApi'

const AdminDashboard: React.FC = () => {
    // RTK Query Hook - Get complete dashboard data
    const { data: dashboardData, isLoading: dataIsLoading, error } = DashboardApi.useGetAdminDashboardDataQuery()

    console.log("Dashboard API Response:", dashboardData); // Debug log

    // Safe data access - the data is already extracted by transformResponse
    const stats = dashboardData?.stats || {
        totalUsers: 0,
        totalVehicles: 0,
        totalBookings: 0,
        activeBookings: 0,
        revenue: 0,
        availableVehicles: 0,
        maintenanceVehicles: 0,
        pendingVerifications: 0
    };

    const activities = dashboardData?.activities || [];
    const popularModels = dashboardData?.popularModels || [];
    const branchPerformance = dashboardData?.branchPerformance || [];
    const vehicleSummary = dashboardData?.vehicleSummary || [];
    const systemHealth = dashboardData?.systemHealth || {
        database_size: "N/A",
        active_sessions: 0,
        avg_response_time: 0,
        error_rate: 0
    };

    // Get active bookings from recent activities
    const activeBookings = activities.filter(activity => 
        activity.type === 'booking' && 
        activity.description?.toLowerCase().includes('active')
    ).slice(0, 5);

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case 'Active': return 'badge-success';
            case 'Completed': return 'badge-info';
            case 'Cancelled': return 'badge-error';
            case 'Confirmed': return 'badge-warning';
            case 'Pending': return 'badge-neutral';
            default: return 'badge-neutral';
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    }

    const formatTimeAgo = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
            
            if (diffInHours < 1) return 'Just now';
            if (diffInHours < 24) return `${diffInHours} hours ago`;
            if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
            
            return formatDate(dateString);
        } catch (error) {
            return 'Recently';
        }
    }

    if (dataIsLoading) {
        return (
            <AdminDashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="loading loading-spinner loading-lg"></div>
                    <span className="ml-4 text-gray-600">Loading dashboard data...</span>
                </div>
            </AdminDashboardLayout>
        )
    }

    if (error) {
        console.error('Dashboard API Error:', error);
        return (
            <AdminDashboardLayout>
                <div className="alert alert-error mb-6">
                    <AlertTriangle className="w-6 h-6" />
                    <span>Error loading dashboard data. Please try again later.</span>
                    <div className="text-sm mt-2">
                        Error: {error.toString()}
                    </div>
                </div>
                
                {/* Fallback minimal dashboard */}
                <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-white">Car Rental Dashboard</h1>
                    <p className="text-blue-200 mt-2">Welcome to your Car Rental Management System</p>
                    <div className="flex items-center mt-4 text-blue-100">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <span>Unable to load real-time data</span>
                    </div>
                </div>
            </AdminDashboardLayout>
        )
    }

    return (
        <AdminDashboardLayout>
            {/* Dashboard Header */}
            <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-white">Car Rental Dashboard</h1>
                <p className="text-blue-200 mt-2">Welcome to your Car Rental Management System</p>
                <div className="flex items-center mt-4 text-blue-100">
                    <Shield className="w-5 h-5 mr-2" />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Bookings */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                            <p className="text-green-600 text-sm mt-1 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                {stats.activeBookings} active
                            </p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-3">
                            <Calendar className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Available Vehicles */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm font-medium">Available Vehicles</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.availableVehicles}</p>
                            <p className="text-green-600 text-sm mt-1 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                of {stats.totalVehicles} total
                            </p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-3">
                            <Car className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
                            <p className="text-gray-500 text-sm mt-1">All time</p>
                        </div>
                        <div className="bg-green-100 rounded-full p-3">
                            <DollarSign className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Total Customers */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm font-medium">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                            <p className="text-gray-500 text-sm mt-1">Registered users</p>
                        </div>
                        <div className="bg-purple-100 rounded-full p-3">
                            <Users className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Vehicles in Maintenance */}
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm font-medium">Vehicles in Maintenance</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.maintenanceVehicles}</p>
                            <p className="text-yellow-600 text-sm mt-1">Requiring service</p>
                        </div>
                        <div className="bg-yellow-100 rounded-full p-3">
                            <Wrench className="text-yellow-600" size={20} />
                        </div>
                    </div>
                </div>

                {/* Pending Verifications */}
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm font-medium">Pending Verifications</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
                            <p className="text-orange-600 text-sm mt-1">Customer documents</p>
                        </div>
                        <div className="bg-orange-100 rounded-full p-3">
                            <Clipboard className="text-orange-600" size={20} />
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm font-medium">System Health</p>
                            <p className="text-2xl font-bold text-gray-900">{systemHealth.active_sessions}</p>
                            <p className="text-blue-600 text-sm mt-1">Active sessions</p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-3">
                            <Shield className="text-blue-600" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Bookings */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
                        <button className="btn btn-sm bg-blue-800 hover:bg-blue-900 text-white border-none">
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {activities.slice(0, 5).map((activity, index) => (
                            <div key={activity.id || index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{activity.description}</p>
                                    <p className="text-gray-500 text-sm">
                                        {activity.username && `by ${activity.username} • `}
                                        {activity.timestamp ? formatTimeAgo(activity.timestamp) : 'Recently'}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <div className="text-center text-gray-500 py-4">
                                No recent activities
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Popular Models */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="btn bg-blue-800 hover:bg-blue-900 text-white border-none flex flex-col items-center p-4 h-auto">
                                <Car className="w-6 h-6 mb-2" />
                                <span className="text-sm">Add Vehicle</span>
                            </button>
                            <button className="btn bg-green-600 hover:bg-green-700 text-white border-none flex flex-col items-center p-4 h-auto">
                                <Calendar className="w-6 h-6 mb-2" />
                                <span className="text-sm">New Booking</span>
                            </button>
                            <button className="btn bg-orange-500 hover:bg-orange-600 text-white border-none flex flex-col items-center p-4 h-auto">
                                <Users className="w-6 h-6 mb-2" />
                                <span className="text-sm">Customers</span>
                            </button>
                            <button className="btn bg-purple-600 hover:bg-purple-700 text-white border-none flex flex-col items-center p-4 h-auto">
                                <Clipboard className="w-6 h-6 mb-2" />
                                <span className="text-sm">Reports</span>
                            </button>
                        </div>
                    </div>

                    {/* Popular Car Models */}
                    {popularModels.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Models</h2>
                            <div className="space-y-3">
                                {popularModels.slice(0, 3).map((model) => (
                                    <div key={model.model_id || `${model.make}-${model.model}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{model.make} {model.model}</p>
                                            <p className="text-gray-500 text-sm">{model.year} • {model.booking_count} bookings</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-700">{formatCurrency(model.total_revenue || 0)}</p>
                                            <p className="text-gray-500 text-sm">revenue</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Analytics Section - Only show if data exists */}
            {(branchPerformance.length > 0 || vehicleSummary.length > 0) && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Branch Performance */}
                    {branchPerformance.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Branch Performance</h2>
                            <div className="space-y-3">
                                {branchPerformance.slice(0, 4).map((branch) => (
                                    <div key={branch.branch_id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center">
                                            <Building className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="font-medium text-gray-900">{branch.branch_name}</p>
                                                <p className="text-gray-500 text-sm">{branch.available_vehicles} vehicles available</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{branch.total_bookings} bookings</p>
                                            <p className="text-green-700 text-sm">{formatCurrency(branch.total_revenue || 0)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vehicle Status Overview */}
                    {vehicleSummary.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Status</h2>
                            <div className="space-y-3">
                                {vehicleSummary.map((status) => (
                                    <div key={status.status} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-3 ${
                                                status.status === 'Available' ? 'bg-green-500' :
                                                status.status === 'Booked' ? 'bg-blue-500' :
                                                status.status === 'Under Maintenance' ? 'bg-yellow-500' : 'bg-gray-500'
                                            }`}></div>
                                            <span className="font-medium text-gray-900">{status.status}</span>
                                        </div>
                                        <span className="font-semibold text-gray-700">{status.count} vehicles</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AdminDashboardLayout>
    )
}

export default AdminDashboard