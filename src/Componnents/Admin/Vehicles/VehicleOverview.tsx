// components/admin/VehicleOverview.tsx
import React, { useState, useMemo } from 'react'
import { Search, Filter, Eye, Edit, Trash2, Download, Car, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreVertical, RefreshCw, Archive, AlertCircle } from 'lucide-react'
import { type VehicleWithDetails } from '../../../types/vehicletype'

interface VehicleOverviewProps {
    vehicles: VehicleWithDetails[]
    isLoading: boolean
    error: any
    onViewVehicle: (id: number) => void
    onEditVehicle: (id: number) => void
    onDeleteVehicle: (id: number) => void
    onSoftDeleteVehicle: (id: number) => void // New prop for soft delete
    onUpdateStatus: (id: number, currentStatus: string) => void
    onRefresh?: () => void
}

const VehicleOverview: React.FC<VehicleOverviewProps> = ({
    vehicles,
    isLoading,
    error,
    onViewVehicle,
    onEditVehicle,
    onDeleteVehicle,
    onSoftDeleteVehicle, // New prop
    onUpdateStatus,
    onRefresh
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [branchFilter, setBranchFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    const [showRetiredOnly, setShowRetiredOnly] = useState(false) // New state for retired filter

    // Get unique filters
    const branches = useMemo(() => 
        Array.from(new Set(vehicles.map(v => v.branch_name).filter(Boolean))), 
        [vehicles]
    )
    const vehicleTypes = useMemo(() => 
        Array.from(new Set(vehicles.map(v => v.vehicle_type))), 
        [vehicles]
    )

    // Filter vehicles
    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle => {
            const matchesSearch = 
                vehicle.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.vin_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.color.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
            const matchesBranch = branchFilter === 'all' || vehicle.branch_name === branchFilter
            const matchesType = typeFilter === 'all' || vehicle.vehicle_type === typeFilter
            const matchesRetiredFilter = !showRetiredOnly || vehicle.status === 'Retired'

            return matchesSearch && matchesStatus && matchesBranch && matchesType && matchesRetiredFilter
        })
    }, [vehicles, searchTerm, statusFilter, branchFilter, typeFilter, showRetiredOnly])

    // Count retired vehicles
    const retiredCount = useMemo(() => 
        vehicles.filter(v => v.status === 'Retired').length,
        [vehicles]
    )

    // Pagination
    const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex)

    // Get status badge
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'Available': 'bg-green-100 text-green-800 border border-green-200',
            'Booked': 'bg-blue-100 text-blue-800 border border-blue-200',
            'Under Maintenance': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            'Retired': 'bg-red-100 text-red-800 border border-red-200',
            'Rented': 'bg-purple-100 text-purple-800 border border-purple-200'
        }
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                {status}
            </span>
        )
    }

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'Available': return '🟢';
            case 'Booked': return '🟡';
            case 'Under Maintenance': return '🟠';
            case 'Retired': return '🔴';
            case 'Rented': return '🟣';
            default: return '⚪';
        }
    }

    // Get vehicle status for action buttons
    const getVehicleActionButtons = (vehicle: VehicleWithDetails) => {
        const isRetired = vehicle.status === 'Retired'
        
        return (
            <div className="flex items-center justify-center gap-1">
                <button
                    onClick={() => onViewVehicle(vehicle.vehicle_id)}
                    className="btn btn-ghost btn-square btn-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    title="View Details"
                >
                    <Eye size={16} />
                </button>
                
                {!isRetired && (
                    <>
                        <button
                            onClick={() => onEditVehicle(vehicle.vehicle_id)}
                            className="btn btn-ghost btn-square btn-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                            title="Edit Vehicle"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => onUpdateStatus(vehicle.vehicle_id, vehicle.status)}
                            className="btn btn-ghost btn-square btn-sm text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                            title="Update Status"
                        >
                            <Filter size={16} />
                        </button>
                        <button
                            onClick={() => onSoftDeleteVehicle(vehicle.vehicle_id)}
                            className="btn btn-ghost btn-square btn-sm text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                            title="Retire Vehicle (Soft Delete)"
                        >
                            <Archive size={16} />
                        </button>
                    </>
                )}
                
                <button
                    onClick={() => onDeleteVehicle(vehicle.vehicle_id)}
                    className="btn btn-ghost btn-square btn-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    title="Permanently Delete Vehicle"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        )
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    const handleRowsPerPageChange = (value: number) => {
        setRowsPerPage(value)
        setCurrentPage(1)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <span className="loading loading-spinner loading-lg text-blue-600 mb-3"></span>
                <span className="text-gray-600 font-medium">Loading vehicles...</span>
                <span className="text-sm text-gray-500 mt-1">Please wait while we fetch your fleet</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="text-red-500" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Vehicles</h3>
                <p className="text-red-600 mb-4">Unable to fetch vehicles. Please try again later.</p>
                {onRefresh && (
                    <button 
                        onClick={onRefresh}
                        className="btn btn-outline btn-error gap-2"
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header with filters */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search vehicles by registration, VIN, model, or color..."
                                className="input input-bordered w-full pl-12 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="btn btn-outline gap-2"
                        >
                            <Filter size={18} />
                            Advanced Filters
                        </button>
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="btn btn-outline gap-2"
                                title="Refresh data"
                            >
                                <RefreshCw size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Status Filter</span>
                                </label>
                                <select 
                                    className="select select-bordered w-full"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="Available">Available</option>
                                    <option value="Booked">Booked</option>
                                    <option value="Under Maintenance">Under Maintenance</option>
                                    <option value="Retired">Retired</option>
                                    <option value="Rented">Rented</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Branch Filter</span>
                                </label>
                                <select 
                                    className="select select-bordered w-full"
                                    value={branchFilter}
                                    onChange={(e) => setBranchFilter(e.target.value)}
                                >
                                    <option value="all">All Branches</option>
                                    {branches.map(branch => (
                                        <option key={branch} value={branch}>{branch}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Type Filter</span>
                                </label>
                                <select 
                                    className="select select-bordered w-full"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    {vehicleTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Additional filters */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-3">
                                    <input 
                                        type="checkbox" 
                                        className="checkbox checkbox-primary" 
                                        checked={showRetiredOnly}
                                        onChange={(e) => setShowRetiredOnly(e.target.checked)}
                                    />
                                    <span className="label-text font-medium">Show only retired vehicles</span>
                                    {retiredCount > 0 && (
                                        <span className="badge badge-outline ml-2">
                                            {retiredCount} retired
                                        </span>
                                    )}
                                </label>
                            </div>
                        </div>
                        
                        {/* Active filters */}
                        {(statusFilter !== 'all' || branchFilter !== 'all' || typeFilter !== 'all' || showRetiredOnly) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {statusFilter !== 'all' && (
                                    <span className="badge badge-primary gap-2">
                                        Status: {statusFilter}
                                        <button onClick={() => setStatusFilter('all')} className="hover:text-white">×</button>
                                    </span>
                                )}
                                {branchFilter !== 'all' && (
                                    <span className="badge badge-secondary gap-2">
                                        Branch: {branchFilter}
                                        <button onClick={() => setBranchFilter('all')} className="hover:text-white">×</button>
                                    </span>
                                )}
                                {typeFilter !== 'all' && (
                                    <span className="badge badge-accent gap-2">
                                        Type: {typeFilter}
                                        <button onClick={() => setTypeFilter('all')} className="hover:text-white">×</button>
                                    </span>
                                )}
                                {showRetiredOnly && (
                                    <span className="badge badge-error gap-2">
                                        Retired Only
                                        <button onClick={() => setShowRetiredOnly(false)} className="hover:text-white">×</button>
                                    </span>
                                )}
                                <button 
                                    onClick={() => {
                                        setStatusFilter('all')
                                        setBranchFilter('all')
                                        setTypeFilter('all')
                                        setShowRetiredOnly(false)
                                    }}
                                    className="btn btn-ghost btn-xs"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Results summary */}
                <div className="flex items-center justify-between mt-4 text-sm">
                    <div className="text-gray-600">
                        Showing <span className="font-semibold">{filteredVehicles.length}</span> of{' '}
                        <span className="font-semibold">{vehicles.length}</span> vehicles
                        {filteredVehicles.length !== vehicles.length && (
                            <span className="text-blue-600 ml-2">(Filtered)</span>
                        )}
                        {retiredCount > 0 && (
                            <span className="ml-2">
                                • <span className="text-red-600">{retiredCount} retired</span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">Rows per page:</span>
                        <select 
                            className="select select-bordered select-sm"
                            value={rowsPerPage}
                            onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Retired Vehicles Alert */}
            {showRetiredOnly && retiredCount > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-y border-red-200 px-6 py-3">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={20} />
                        <div>
                            <span className="font-medium text-red-800">Showing {retiredCount} retired vehicles</span>
                            <span className="text-red-600 text-sm ml-2">
                                Retired vehicles are soft-deleted and can be restored if needed
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="text-left font-semibold text-gray-700 py-4 px-6">Vehicle</th>
                            <th className="text-left font-semibold text-gray-700 py-4 px-6">Registration</th>
                            <th className="text-left font-semibold text-gray-700 py-4 px-6">Model</th>
                            <th className="text-left font-semibold text-gray-700 py-4 px-6">Mileage</th>
                            <th className="text-left font-semibold text-gray-700 py-4 px-6">Daily Rate</th>
                            <th className="text-left font-semibold text-gray-700 py-4 px-6">Status</th>
                            <th className="text-left font-semibold text-gray-700 py-4 px-6">Branch</th>
                            <th className="text-center font-semibold text-gray-700 py-4 px-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedVehicles.map((vehicle) => {
                            const isRetired = vehicle.status === 'Retired'
                            
                            return (
                                <tr 
                                    key={vehicle.vehicle_id} 
                                    className={`hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                                        isRetired ? 'bg-red-50 hover:bg-red-100' : ''
                                    }`}
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="avatar">
                                                <div className={`mask mask-squircle w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 ${
                                                    isRetired ? 'opacity-70' : ''
                                                }`}>
                                                    {vehicle.images?.[0] ? (
                                                        <img
                                                            src={vehicle.images[0].image_url}
                                                            alt={vehicle.registration_number}
                                                            className={`object-cover w-full h-full hover:scale-105 transition-transform duration-300 ${
                                                                isRetired ? 'grayscale' : ''
                                                            }`}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Car size={24} className={`${isRetired ? 'text-gray-500' : 'text-gray-400'}`} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className={`font-bold text-sm ${
                                                    isRetired ? 'text-gray-500' : 'text-gray-800'
                                                }`}>
                                                    #{vehicle.vehicle_id}
                                                    {isRetired && (
                                                        <span className="ml-2 text-xs text-red-500">(Retired)</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div 
                                                        className={`w-3 h-3 rounded-full ${
                                                            isRetired ? 'opacity-50' : ''
                                                        }`}
                                                        style={{ backgroundColor: vehicle.color.toLowerCase() }}
                                                        title={vehicle.color}
                                                    />
                                                    <span className={`text-sm ${
                                                        isRetired ? 'text-gray-500' : 'text-gray-600'
                                                    }`}>
                                                        {vehicle.color}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className={`font-mono text-sm px-3 py-1 rounded-lg border inline-block ${
                                            isRetired 
                                                ? 'bg-gray-100 text-gray-500 border-gray-300' 
                                                : 'bg-gray-50 border-gray-200'
                                        }`}>
                                            {vehicle.registration_number}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div>
                                            <div className={`font-semibold ${
                                                isRetired ? 'text-gray-500' : 'text-gray-800'
                                            }`}>
                                                {vehicle.make} {vehicle.model}
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                <span>{vehicle.year}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className={`badge badge-outline badge-xs ${
                                                    isRetired ? 'badge-ghost' : ''
                                                }`}>
                                                    {vehicle.vehicle_type}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium ${
                                                isRetired ? 'text-gray-500' : 'text-gray-800'
                                            }`}>
                                                {vehicle.current_mileage.toLocaleString()} km
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${
                                                isRetired ? 'text-gray-500 line-through' : 'text-green-600'
                                            }`}>
                                                ${vehicle.effective_daily_rate}
                                            </span>
                                            {vehicle.actual_daily_rate && vehicle.actual_daily_rate !== vehicle.effective_daily_rate && (
                                                <span className="text-xs text-gray-500 line-through">
                                                    ${vehicle.actual_daily_rate}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getStatusIcon(vehicle.status)}</span>
                                            {getStatusBadge(vehicle.status)}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className={`text-sm ${
                                            isRetired ? 'text-gray-500' : 'text-gray-600'
                                        }`}>
                                            {vehicle.branch_name || (
                                                <span className={`${isRetired ? 'text-gray-400' : 'text-orange-600'} italic`}>
                                                    Unassigned
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {getVehicleActionButtons(vehicle)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {filteredVehicles.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Car className="text-gray-400" size={48} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No vehicles found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for</p>
                        {(searchTerm || statusFilter !== 'all' || branchFilter !== 'all' || typeFilter !== 'all' || showRetiredOnly) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('')
                                    setStatusFilter('all')
                                    setBranchFilter('all')
                                    setTypeFilter('all')
                                    setShowRetiredOnly(false)
                                }}
                                className="btn btn-primary gap-2"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredVehicles.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                            <span className="font-semibold">{Math.min(endIndex, filteredVehicles.length)}</span> of{' '}
                            <span className="font-semibold">{filteredVehicles.length}</span> vehicles
                            {showRetiredOnly && (
                                <span className="ml-2 text-red-600">
                                    ({retiredCount} retired)
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className="btn btn-ghost btn-square btn-sm disabled:opacity-50"
                                title="First page"
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="btn btn-ghost btn-square btn-sm disabled:opacity-50"
                                title="Previous page"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum
                                    if (totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i
                                    } else {
                                        pageNum = currentPage - 2 + i
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}
                            </div>
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="btn btn-ghost btn-square btn-sm disabled:opacity-50"
                                title="Next page"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="btn btn-ghost btn-square btn-sm disabled:opacity-50"
                                title="Last page"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                        
                        <button className="btn btn-outline btn-sm gap-2">
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VehicleOverview