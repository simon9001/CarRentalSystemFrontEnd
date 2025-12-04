// src/components/admin/BranchDetailsModal.tsx
import React from 'react'
import { X, Building2, MapPin, Phone, Mail, Users, Clock, Calendar, Car, User, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { BranchApi } from '../../../features/Api/BranchApi'

interface BranchDetailsModalProps {
    branchId: number
    onClose: () => void
    onEdit: () => void
    onStatus: () => void
    onManager: () => void
    onDelete: () => void
}

const BranchDetailsModal: React.FC<BranchDetailsModalProps> = ({ 
    branchId, onClose, onEdit, onStatus, onManager, onDelete 
}) => {
    const { data: branch, isLoading } = BranchApi.useGetBranchByIdQuery(branchId)
    const { data: statistics } = BranchApi.useGetBranchStatisticsQuery(branchId)

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-8">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                </div>
            </div>
        )
    }

    if (!branch) {
        return null
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Building2 size={24} />
                            {branch.branch_name}
                        </h2>
                        <p className="text-gray-600">Branch ID: #{branch.branch_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onManager} className="btn btn-primary btn-sm gap-2">
                            <Users size={16} />
                            Manager
                        </button>
                        <button onClick={onStatus} className="btn btn-warning btn-sm gap-2">
                            {branch.is_active ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                            Status
                        </button>
                        <button onClick={onEdit} className="btn btn-success btn-sm gap-2">
                            <Edit size={16} />
                            Edit
                        </button>
                        <button onClick={onDelete} className="btn btn-error btn-sm gap-2">
                            <Trash2 size={16} />
                            Delete
                        </button>
                        <button onClick={onClose} className="btn btn-ghost btn-circle">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[80vh]">
                    <div className="p-6">
                        {/* Status Banner */}
                        <div className={`p-4 rounded-lg mb-6 ${
                            branch.is_active 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {branch.is_active ? (
                                        <ToggleRight className="text-green-600" size={24} />
                                    ) : (
                                        <ToggleLeft className="text-red-600" size={24} />
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {branch.is_active ? 'Active Branch' : 'Inactive Branch'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {branch.is_active 
                                                ? 'This branch is currently operational and accepting bookings' 
                                                : 'This branch is temporarily closed and not accepting bookings'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <span className={`badge badge-lg ${
                                    branch.is_active ? 'badge-success' : 'badge-error'
                                }`}>
                                    {branch.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Branch Information */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch Information</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="text-gray-400" size={20} />
                                            <div>
                                                <div className="text-sm text-gray-600">Branch Name</div>
                                                <div className="font-semibold">{branch.branch_name}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="text-gray-400" size={20} />
                                            <div>
                                                <div className="text-sm text-gray-600">Address</div>
                                                <div className="font-semibold">{branch.address}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="text-gray-400" size={20} />
                                            <div>
                                                <div className="text-sm text-gray-600">City</div>
                                                <div className="font-semibold">{branch.city}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        {branch.phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="text-gray-400" size={20} />
                                                <div>
                                                    <div className="text-sm text-gray-600">Phone</div>
                                                    <div className="font-semibold">{branch.phone}</div>
                                                </div>
                                            </div>
                                        )}
                                        {branch.email && (
                                            <div className="flex items-center gap-3">
                                                <Mail className="text-gray-400" size={20} />
                                                <div>
                                                    <div className="text-sm text-gray-600">Email</div>
                                                    <div className="font-semibold">{branch.email}</div>
                                                </div>
                                            </div>
                                        )}
                                        {branch.opening_hours && (
                                            <div className="flex items-center gap-3">
                                                <Clock className="text-gray-400" size={20} />
                                                <div>
                                                    <div className="text-sm text-gray-600">Opening Hours</div>
                                                    <div className="font-semibold">{branch.opening_hours}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Operational Details */}
                            <div className="space-y-6">
                                {/* Manager Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Manager Information</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        {branch.manager_id ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <User className="text-green-500" size={20} />
                                                    <div>
                                                        <div className="text-sm text-gray-600">Manager</div>
                                                        <div className="font-semibold">Manager #{branch.manager_id}</div>
                                                    </div>
                                                </div>
                                                <span className="badge badge-success">Assigned</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Users className="text-gray-400" size={20} />
                                                    <div>
                                                        <div className="text-sm text-gray-600">Manager</div>
                                                        <div className="font-semibold text-gray-500">No Manager Assigned</div>
                                                    </div>
                                                </div>
                                                <span className="badge badge-ghost">Unassigned</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Branch Statistics */}
                                {statistics && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch Statistics</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                                <Car className="mx-auto text-blue-500 mb-2" size={24} />
                                                <div className="text-2xl font-bold text-blue-600">{statistics.vehicle_count}</div>
                                                <div className="text-sm text-blue-700">Vehicles</div>
                                            </div>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                                <Users className="mx-auto text-green-500 mb-2" size={24} />
                                                <div className="text-2xl font-bold text-green-600">{statistics.staff_count}</div>
                                                <div className="text-sm text-green-700">Staff</div>
                                            </div>
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                                                <Calendar className="mx-auto text-purple-500 mb-2" size={24} />
                                                <div className="text-2xl font-bold text-purple-600">{statistics.total_bookings}</div>
                                                <div className="text-sm text-purple-700">Total Bookings</div>
                                            </div>
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                                                <Clock className="mx-auto text-orange-500 mb-2" size={24} />
                                                <div className="text-2xl font-bold text-orange-600">{statistics.active_bookings}</div>
                                                <div className="text-sm text-orange-700">Active Bookings</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Timestamps */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Timestamps</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Created</span>
                                            <span className="text-sm font-semibold">{formatDate(branch.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Last Updated</span>
                                            <span className="text-sm font-semibold">{formatDate(branch.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Branch Notes Section - Placeholder */}
                        <div className="mt-8 border-t border-gray-200 pt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch Notes & Updates</h3>
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <Building2 className="mx-auto text-gray-400 mb-3" size={32} />
                                <div className="font-semibold text-gray-700 mb-2">Branch Management</div>
                                <div className="text-sm text-gray-500">
                                    Add operational notes and updates for this branch in the future updates
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BranchDetailsModal