// components/admin/VehicleManagement.tsx
import React, { useState, useEffect } from 'react'
import AdminDashboardLayout from '../../../dashboardDesign/AdminDashboardLayout'
import { Car, Plus, Search, Filter, Edit, Trash2, Eye, Download, Upload, AlertTriangle, Wrench, Shield, BarChart3, RefreshCw, Calendar, Users, TrendingUp, FilterX, Archive, AlertCircle, DollarSign, MapPin, Gauge } from 'lucide-react'
import { VehicleApi } from '../../../features/Api/VehicleApi'
import Swal from 'sweetalert2'
import VehicleOverview from './VehicleOverview.tsx'
import CreateVehicleModal from './CreateVehicleModal.tsx'
import VehicleDetailsModal from './VehicleDetailsModal.tsx'
import EditVehicleModal from './EditVehicleModal.tsx'

// Import types from your vehicletype file
import type { 
  VehicleWithDetails, 
  ServiceDueVehicle as ApiServiceDueVehicle,
  InsuranceExpiringVehicle as ApiInsuranceExpiringVehicle,
  VehicleStatistics 
} from '../../../types/vehicletype'

// Create compatible local types
interface LocalVehicle {
  vehicle_id: number;
  registration_number: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  primary_image_url?: string;
  status: string;
  effective_daily_rate: number;
  current_mileage: number;
  branch_name?: string;
  color: string;
  vin_number: string;
  fuel_type: string;
  transmission: string;
  seating_capacity: number;
}

interface ServiceDueVehicle extends LocalVehicle {
  days_until_service?: number;
}

interface InsuranceExpiringVehicle extends LocalVehicle {
  days_until_insurance_expiry?: number;
}

// Helper function to map API data to local types
const mapApiVehicle = (apiVehicle: any): LocalVehicle => ({
  vehicle_id: apiVehicle.vehicle_id || 0,
  registration_number: apiVehicle.registration_number || '',
  make: apiVehicle.make || '',
  model: apiVehicle.model || '',
  year: apiVehicle.year || new Date().getFullYear(),
  vehicle_type: apiVehicle.vehicle_type || 'Unknown',
  primary_image_url: apiVehicle.primary_image_url,
  status: apiVehicle.status || 'Unknown',
  effective_daily_rate: apiVehicle.effective_daily_rate || apiVehicle.daily_rate || 0,
  current_mileage: apiVehicle.current_mileage || 0,
  branch_name: apiVehicle.branch_name,
  color: apiVehicle.color || 'Unknown',
  vin_number: apiVehicle.vin_number || '',
  fuel_type: apiVehicle.fuel_type || 'Unknown',
  transmission: apiVehicle.transmission || 'Unknown',
  seating_capacity: apiVehicle.seating_capacity || 0
})

const VehicleManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'alerts' | 'analytics'>('overview')
    const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)
    const [viewVehicle, setViewVehicle] = useState<number | null>(null)
    const [editVehicle, setEditVehicle] = useState<number | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    
    // RTK Query hooks with refresh trigger
    const { 
      data: vehicles, 
      isLoading: vehiclesLoading, 
      error: vehiclesError,
      refetch: refetchVehicles
    } = VehicleApi.useGetAllVehiclesQuery(undefined, {
      refetchOnMountOrArgChange: true,
      skip: false
    })
    
    const { 
      data: statistics, 
      isLoading: statsLoading, 
      error: statsError,
      refetch: refetchStats
    } = VehicleApi.useGetVehicleStatisticsQuery()
    
    const [deleteVehicle] = VehicleApi.useDeleteVehicleMutation()
    const [softDeleteVehicle] = VehicleApi.useSoftDeleteVehicleMutation()
    const [updateStatus] = VehicleApi.useUpdateVehicleStatusMutation()

    // Map API data to local types
    const mappedVehicles: LocalVehicle[] = React.useMemo(() => {
      if (!vehicles) return []
      if (Array.isArray(vehicles)) {
        return vehicles.map(mapApiVehicle)
      }
      // Handle if vehicles is an object with data property
      const vehiclesArray = vehicles.data || vehicles
      return Array.isArray(vehiclesArray) 
        ? vehiclesArray.map(mapApiVehicle)
        : []
    }, [vehicles])

    // Auto-refresh every 30 seconds
    useEffect(() => {
      const interval = setInterval(() => {
        refetchVehicles()
        refetchStats()
      }, 30000)
      
      return () => clearInterval(interval)
    }, [refetchVehicles, refetchStats])

    // Handle manual refresh
    // const handleRefresh = () => {
    //   refetchVehicles()
    //   refetchStats()
    //   setRefreshTrigger(prev => prev + 1)
    //   Swal.fire({
    //     title: 'Refreshing...',
    //     text: 'Fetching latest vehicle data',
    //     icon: 'info',
    //     timer: 1000,
    //     showConfirmButton: false
    //   })
    // }

    // Handle vehicle deletion (hard delete)
    const handleDeleteVehicle = async (vehicleId: number) => {
        const result = await Swal.fire({
            title: 'Permanently Delete Vehicle?',
            text: "This action will permanently delete the vehicle from the system! This cannot be undone.",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete permanently!',
            cancelButtonText: 'Cancel',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    return await deleteVehicle(vehicleId).unwrap()
                } catch (error: any) {
                    Swal.showValidationMessage(
                        error?.data?.message || 'Failed to delete vehicle'
                    )
                }
            }
        })

        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Vehicle has been permanently deleted.',
                'success'
            )
        }
    }

    // Handle soft delete (retire vehicle)
    const handleSoftDeleteVehicle = async (vehicleId: number) => {
        const result = await Swal.fire({
            title: 'Retire Vehicle?',
            text: "This will mark the vehicle as retired. You can restore it later by changing its status.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, retire it!',
            cancelButtonText: 'Cancel',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    return await softDeleteVehicle(vehicleId).unwrap()
                } catch (error: any) {
                    Swal.showValidationMessage(
                        error?.data?.message || 'Failed to retire vehicle'
                    )
                }
            }
        })

        if (result.isConfirmed) {
            Swal.fire(
                'Retired!',
                'Vehicle has been marked as retired.',
                'success'
            )
        }
    }

    // Quick status update
    const handleQuickStatusUpdate = async (vehicleId: number, currentStatus: string) => {
        const statusOptions = ['Available', 'Booked', 'Under Maintenance', 'Retired', 'Rented']
        const { value: newStatus } = await Swal.fire({
            title: 'Update Vehicle Status',
            input: 'select',
            inputOptions: statusOptions.reduce((acc: Record<string, string>, status) => {
                acc[status] = status
                return acc
            }, {}),
            inputPlaceholder: 'Select new status',
            inputValue: currentStatus,
            showCancelButton: true,
            confirmButtonText: 'Update Status',
            confirmButtonColor: '#10b981',
            cancelButtonText: 'Cancel',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    return await updateStatus({
                        vehicle_id: vehicleId,
                        status: { status: newStatus }
                    }).unwrap()
                } catch (error: any) {
                    Swal.showValidationMessage(
                        error?.data?.message || 'Failed to update status'
                    )
                }
            }
        })

        if (newStatus) {
            Swal.fire('Updated!', `Vehicle status updated to ${newStatus}`, 'success')
        }
    }

    // Calculate loading and error states
    const isLoading = vehiclesLoading || statsLoading
    const error = vehiclesError || statsError

    // Calculate additional statistics
    const totalRevenue = mappedVehicles.reduce((sum, vehicle) => sum + vehicle.effective_daily_rate, 0)
    const retiredCount = mappedVehicles.filter(v => v.status === 'Retired').length

    return (
        <AdminDashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                        <Car className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vehicle Management</h1>
                        <p className="text-gray-600">Manage your entire fleet from one dashboard</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {/* <button
                        onClick={handleRefresh}
                        className="btn btn-outline gap-2"
                        title="Refresh data"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button> */}
                    <button
                        onClick={() => setActiveTab('create')}
                        className="btn btn-primary gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                        <Plus size={20} />
                        Add New Vehicle
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Vehicles</p>
                            <p className="text-3xl font-bold text-blue-600">{statistics?.total_vehicles || mappedVehicles.length}</p>
                            <p className="text-xs text-gray-500 mt-1">In fleet</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Car className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-sm border border-green-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Available</p>
                            <p className="text-3xl font-bold text-green-600">
                                {statistics?.available_vehicles || mappedVehicles.filter(v => v.status === 'Available').length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Ready to rent</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Under Maintenance</p>
                            <p className="text-3xl font-bold text-yellow-600">
                                {statistics?.maintenance_vehicles || mappedVehicles.filter(v => v.status === 'Under Maintenance').length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Being serviced</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Wrench className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm border border-red-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Retired Vehicles</p>
                            <p className="text-3xl font-bold text-red-600">{retiredCount}</p>
                            <p className="text-xs text-red-500 mt-1">Soft deleted</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <Archive className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Eye size={18} />
                                Vehicle Overview
                                {mappedVehicles.length > 0 && (
                                    <span className="badge badge-primary badge-sm">
                                        {mappedVehicles.length}
                                    </span>
                                )}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                activeTab === 'alerts'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={18} />
                                Maintenance Alerts
                                {statistics && (statistics.overdue_service || 0) > 0 && (
                                    <span className="badge badge-error badge-sm animate-pulse">
                                        {statistics.overdue_service}
                                    </span>
                                )}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                activeTab === 'analytics'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <BarChart3 size={18} />
                                Analytics
                            </div>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fadeIn">
                {activeTab === 'overview' && (
                    <VehicleOverview
                        vehicles={mappedVehicles as any} // Cast to any to avoid type issues
                        isLoading={isLoading}
                        error={error}
                        onViewVehicle={setViewVehicle}
                        onEditVehicle={setEditVehicle}
                        onDeleteVehicle={handleDeleteVehicle}
                        onSoftDeleteVehicle={handleSoftDeleteVehicle}
                        onUpdateStatus={handleQuickStatusUpdate}
                        // onRefresh={handleRefresh}
                    />
                )}

                {activeTab === 'create' && (
                    <CreateVehicleModal
                        onClose={() => setActiveTab('overview')}
                        onSuccess={() => {
                            setActiveTab('overview')
                            // handleRefresh()
                            Swal.fire({
                                title: 'Success!',
                                text: 'Vehicle created successfully.',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            })
                        }}
                    />
                )}

                {activeTab === 'alerts' && (
                    <MaintenanceAlerts />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsDashboard 
                        vehicles={mappedVehicles}
                        statistics={statistics}
                        isLoading={statsLoading}
                    />
                )}
            </div>

            {/* Modals */}
            {viewVehicle && (
                <VehicleDetailsModal
                    vehicleId={viewVehicle}
                    onClose={() => setViewVehicle(null)}
                    onEdit={() => {
                        setEditVehicle(viewVehicle)
                        setViewVehicle(null)
                    }}
                />
            )}

            {editVehicle && (
                <EditVehicleModal
                    vehicleId={editVehicle}
                    onClose={() => setEditVehicle(null)}
                    onSuccess={() => {
                        setEditVehicle(null)
                        // handleRefresh()
                        Swal.fire({
                            title: 'Success!',
                            text: 'Vehicle updated successfully.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        })
                    }}
                />
            )}
        </AdminDashboardLayout>
    )
}

// Maintenance Alerts Component
const MaintenanceAlerts: React.FC = () => {
    const { 
      data: serviceDue, 
      isLoading: serviceLoading, 
      error: serviceError,
      refetch: refetchService 
    } = VehicleApi.useGetVehiclesDueForServiceQuery()
    
    const { 
      data: insuranceExpiring, 
      isLoading: insuranceLoading, 
      error: insuranceError,
      refetch: refetchInsurance 
    } = VehicleApi.useGetVehiclesWithExpiringInsuranceQuery()

    const handleRefresh = () => {
        refetchService()
        refetchInsurance()
    }

    // Map API data to local types safely
    const mapServiceDue = (apiVehicle: any): ServiceDueVehicle => ({
      ...mapApiVehicle(apiVehicle),
      days_until_service: apiVehicle.days_until_service
    })

    const mapInsuranceExpiring = (apiVehicle: any): InsuranceExpiringVehicle => ({
      ...mapApiVehicle(apiVehicle),
      days_until_insurance_expiry: apiVehicle.days_until_insurance_expiry
    })

    // Handle empty states and map data
    const safeServiceDue = React.useMemo(() => {
      if (!serviceDue) return []
      const data = Array.isArray(serviceDue) ? serviceDue : (serviceDue.data || [])
      return Array.isArray(data) ? data.map(mapServiceDue) : []
    }, [serviceDue])

    const safeInsuranceExpiring = React.useMemo(() => {
      if (!insuranceExpiring) return []
      const data = Array.isArray(insuranceExpiring) ? insuranceExpiring : (insuranceExpiring.data || [])
      return Array.isArray(data) ? data.map(mapInsuranceExpiring) : []
    }, [insuranceExpiring])

    const getUrgencyBadge = (days: number | undefined) => {
        if (days === undefined) return <span className="badge badge-ghost">Unknown</span>
        if (days <= 0) return <span className="badge badge-error animate-pulse">OVERDUE</span>
        if (days <= 3) return <span className="badge badge-warning animate-pulse">URGENT</span>
        if (days <= 7) return <span className="badge badge-warning">SOON</span>
        return <span className="badge badge-info">UPCOMING</span>
    }

    const handleScheduleService = (vehicleId: number) => {
        Swal.fire({
            title: 'Schedule Service',
            text: 'This feature will be implemented soon.',
            icon: 'info',
            confirmButtonText: 'OK'
        })
    }

    const handleRenewInsurance = (vehicleId: number) => {
        Swal.fire({
            title: 'Renew Insurance',
            text: 'This feature will be implemented soon.',
            icon: 'info',
            confirmButtonText: 'OK'
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Maintenance Alerts</h2>
                    <p className="text-gray-600">Monitor vehicles needing attention</p>
                </div>
                {/* <button
                    onClick={handleRefresh}
                    className="btn btn-outline gap-2"
                >
                    <RefreshCw size={16} />
                    Refresh Alerts
                </button> */}
            </div>

            {/* Service Due Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-yellow-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Wrench className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Vehicles Due for Service</h3>
                            <p className="text-sm text-gray-600">Regular maintenance required</p>
                        </div>
                        {safeServiceDue.length > 0 && (
                            <span className="badge badge-warning ml-auto">
                                {safeServiceDue.length} vehicles
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-6">
                    {serviceLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-12 h-12 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : serviceError ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-red-500 mb-4">Error loading service due alerts</p>
                            {/* <button onClick={handleRefresh} className="btn btn-error btn-outline">
                                Try Again
                            </button> */}
                        </div>
                    ) : safeServiceDue.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-gray-900 mb-1">All Good!</p>
                            <p className="text-gray-600">No vehicles due for service at this time.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {safeServiceDue.map((vehicle, index) => (
                                <div key={`${vehicle.vehicle_id}-${index}`} className="bg-gradient-to-br from-yellow-50 to-white rounded-lg border border-yellow-200 p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        {vehicle.primary_image_url ? (
                                            <img
                                                src={vehicle.primary_image_url}
                                                alt={vehicle.registration_number}
                                                className="w-16 h-16 rounded-lg object-cover border border-yellow-300"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center border border-yellow-300">
                                                <Car className="text-yellow-600" size={20} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 line-clamp-1">
                                                        {vehicle.make} {vehicle.model}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">#{vehicle.vehicle_id}</p>
                                                </div>
                                                {getUrgencyBadge(vehicle.days_until_service)}
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm text-gray-600">
                                                    Registration: <span className="font-mono font-medium">{vehicle.registration_number}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Due: <span className="font-medium">
                                                        {vehicle.days_until_service !== undefined 
                                                            ? `${vehicle.days_until_service} day${vehicle.days_until_service === 1 ? '' : 's'}`
                                                            : 'Service due'
                                                        }
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <button 
                                                    onClick={() => handleScheduleService(vehicle.vehicle_id)}
                                                    className="btn btn-warning btn-sm gap-2 flex-1"
                                                >
                                                    <Wrench size={14} />
                                                    Schedule Service
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Insurance Expiring Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-red-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Insurance Expiring Soon</h3>
                            <p className="text-sm text-gray-600">Renew insurance coverage</p>
                        </div>
                        {safeInsuranceExpiring.length > 0 && (
                            <span className="badge badge-error ml-auto">
                                {safeInsuranceExpiring.length} vehicles
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-6">
                    {insuranceLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-12 h-12 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : insuranceError ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-red-500 mb-4">Error loading insurance alerts</p>
                            {/* <button onClick={handleRefresh} className="btn btn-error btn-outline">
                                Try Again
                            </button> */}
                        </div>
                    ) : safeInsuranceExpiring.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-gray-900 mb-1">All Good!</p>
                            <p className="text-gray-600">No vehicles with expiring insurance.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {safeInsuranceExpiring.map((vehicle, index) => (
                                <div key={`${vehicle.vehicle_id}-${index}`} className="bg-gradient-to-br from-red-50 to-white rounded-lg border border-red-200 p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        {vehicle.primary_image_url ? (
                                            <img
                                                src={vehicle.primary_image_url}
                                                alt={vehicle.registration_number}
                                                className="w-16 h-16 rounded-lg object-cover border border-red-300"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center border border-red-300">
                                                <Car className="text-red-600" size={20} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 line-clamp-1">
                                                        {vehicle.make} {vehicle.model}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">#{vehicle.vehicle_id}</p>
                                                </div>
                                                {getUrgencyBadge(vehicle.days_until_insurance_expiry)}
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm text-gray-600">
                                                    Registration: <span className="font-mono font-medium">{vehicle.registration_number}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Expires: <span className="font-medium">
                                                        {vehicle.days_until_insurance_expiry !== undefined
                                                            ? `${vehicle.days_until_insurance_expiry} day${vehicle.days_until_insurance_expiry === 1 ? '' : 's'}`
                                                            : 'Insurance expiring'
                                                        }
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <button 
                                                    onClick={() => handleRenewInsurance(vehicle.vehicle_id)}
                                                    className="btn btn-error btn-sm gap-2 flex-1"
                                                >
                                                    <Shield size={14} />
                                                    Renew Insurance
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Analytics Dashboard Component
interface AnalyticsDashboardProps {
    vehicles: LocalVehicle[]
    statistics: any
    isLoading: boolean
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ vehicles, statistics, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <span className="ml-3 text-gray-600">Loading analytics...</span>
            </div>
        )
    }

    // Calculate analytics
    const totalRevenue = vehicles.reduce((sum, v) => sum + v.effective_daily_rate, 0)
    const averageMileage = vehicles.length > 0 
        ? vehicles.reduce((sum, v) => sum + v.current_mileage, 0) / vehicles.length
        : 0
    const retiredCount = vehicles.filter(v => v.status === 'Retired').length
    
    // Group by vehicle type
    const typeDistribution = vehicles.reduce((acc, v) => {
        acc[v.vehicle_type] = (acc[v.vehicle_type] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    // Group by branch
    const branchDistribution = vehicles.reduce((acc, v) => {
        const branch = v.branch_name || 'Unassigned'
        acc[branch] = (acc[branch] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    // Group by status
    const statusDistribution = vehicles.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Vehicle Analytics</h2>
                    <p className="text-gray-600">Insights and performance metrics</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-outline gap-2">
                        <Calendar size={16} />
                        Last 30 Days
                    </button>
                    <button className="btn btn-outline gap-2">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Fleet Value</p>
                            <p className="text-2xl font-bold text-blue-600">${(totalRevenue * 365).toLocaleString()}</p>
                        </div>
                        <TrendingUp className="text-blue-500" size={24} />
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Average Mileage</p>
                            <p className="text-2xl font-bold text-green-600">{Math.round(averageMileage).toLocaleString()} km</p>
                        </div>
                        <Gauge className="text-green-500" size={24} />
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Daily Revenue</p>
                            <p className="text-2xl font-bold text-purple-600">${Math.round(totalRevenue).toLocaleString()}</p>
                        </div>
                        <DollarSign className="text-purple-500" size={24} />
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Retired Vehicles</p>
                            <p className="text-2xl font-bold text-orange-600">{retiredCount}</p>
                        </div>
                        <Archive className="text-orange-500" size={24} />
                    </div>
                </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vehicle Type Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Type Distribution</h3>
                    <div className="space-y-4">
                        {Object.entries(typeDistribution).map(([type, count]) => {
                            const percentage = vehicles.length > 0 ? (count / vehicles.length * 100).toFixed(1) : '0'
                            return (
                                <div key={type} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{type}</span>
                                        <span className="text-gray-600">{count} vehicles ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Branch Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch Distribution</h3>
                    <div className="space-y-4">
                        {Object.entries(branchDistribution).map(([branch, count]) => {
                            const percentage = vehicles.length > 0 ? (count / vehicles.length * 100).toFixed(1) : '0'
                            return (
                                <div key={branch} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{branch}</span>
                                        <span className="text-gray-600">{count} vehicles ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Status Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200">
                        <div className="text-3xl font-bold text-green-600 mb-1">{statusDistribution['Available'] || 0}</div>
                        <div className="text-sm font-medium text-green-800">Available</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                            {(statusDistribution['Booked'] || 0) + (statusDistribution['Rented'] || 0)}
                        </div>
                        <div className="text-sm font-medium text-blue-800">Booked/Rented</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-white rounded-lg border border-yellow-200">
                        <div className="text-3xl font-bold text-yellow-600 mb-1">{statusDistribution['Under Maintenance'] || 0}</div>
                        <div className="text-sm font-medium text-yellow-800">Maintenance</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-white rounded-lg border border-red-200">
                        <div className="text-3xl font-bold text-red-600 mb-1">{statusDistribution['Retired'] || 0}</div>
                        <div className="text-sm font-medium text-red-800">Retired</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VehicleManagement