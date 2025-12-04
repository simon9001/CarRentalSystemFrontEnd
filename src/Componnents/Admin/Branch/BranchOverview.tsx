// src/components/admin/BranchOverview.tsx
import React, { useState, useMemo } from 'react'
import { Search, Eye, Edit, Users, ToggleLeft, ToggleRight, Trash2, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { type BranchResponse } from '../../../types/Branchtypes'

interface BranchOverviewProps {
    branches: BranchResponse[]
    isLoading: boolean
    error: any
    onViewBranch: (id: number) => void
    onEditBranch: (id: number) => void
    onStatusBranch: (id: number) => void
    onManagerBranch: (id: number) => void
    onDeleteBranch: (id: number) => void
}

const BranchOverview: React.FC<BranchOverviewProps> = ({
    branches,
    isLoading,
    error,
    onViewBranch,
    onEditBranch,
    onStatusBranch,
    onManagerBranch,
    onDeleteBranch
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [cityFilter, setCityFilter] = useState('all')
    const [managerFilter, setManagerFilter] = useState('all')

    // Get unique filters
    const cities = useMemo(() => 
        Array.from(new Set(branches.map(b => b.city))), 
        [branches]
    )

    // Filter branches
    const filteredBranches = useMemo(() => {
        return branches.filter(branch => {
            const matchesSearch = 
                branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.email?.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && branch.is_active) ||
                (statusFilter === 'inactive' && !branch.is_active)
            
            const matchesCity = cityFilter === 'all' || branch.city === cityFilter
            const matchesManager = managerFilter === 'all' || 
                (managerFilter === 'with' && branch.manager_id !== null) ||
                (managerFilter === 'without' && branch.manager_id === null)

            return matchesSearch && matchesStatus && matchesCity && matchesManager
        })
    }, [branches, searchTerm, statusFilter, cityFilter, managerFilter])

    // Get status badge
    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <span className="badge badge-success badge-sm">
                <ToggleRight size={12} className="mr-1" />
                Active
            </span>
        ) : (
            <span className="badge badge-error badge-sm">
                <ToggleLeft size={12} className="mr-1" />
                Inactive
            </span>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <span className="ml-3 text-gray-600">Loading branches...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Branches</h3>
                <p className="text-red-600">Unable to fetch branches. Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, address, city, phone, or email..."
                                className="input input-bordered w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        <select 
                            className="select select-bordered select-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <select 
                            className="select select-bordered select-sm"
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                        >
                            <option value="all">All Cities</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        <select 
                            className="select select-bordered select-sm"
                            value={managerFilter}
                            onChange={(e) => setManagerFilter(e.target.value)}
                        >
                            <option value="all">All Managers</option>
                            <option value="with">With Manager</option>
                            <option value="without">Without Manager</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="text-left font-semibold text-gray-700">Branch Name</th>
                            <th className="text-left font-semibold text-gray-700">Location</th>
                            <th className="text-left font-semibold text-gray-700">Contact</th>
                            <th className="text-left font-semibold text-gray-700">Manager</th>
                            <th className="text-left font-semibold text-gray-700">Opening Hours</th>
                            <th className="text-left font-semibold text-gray-700">Status</th>
                            <th className="text-left font-semibold text-gray-700">Created</th>
                            <th className="text-center font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBranches.map((branch) => (
                            <tr 
                                key={branch.branch_id} 
                                className={`hover:bg-gray-50 ${
                                    !branch.is_active ? 'bg-gray-50' : ''
                                }`}
                            >
                                <td>
                                    <div>
                                        <div className="font-bold text-gray-800">{branch.branch_name}</div>
                                        <div className="text-xs text-gray-500">ID: #{branch.branch_id}</div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div className="flex items-center gap-1 text-sm">
                                            <MapPin size={12} className="text-gray-400" />
                                            {branch.city}
                                        </div>
                                        <div className="text-xs text-gray-500 max-w-xs truncate">
                                            {branch.address}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="space-y-1">
                                        {branch.phone && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <Phone size={12} className="text-gray-400" />
                                                {branch.phone}
                                            </div>
                                        )}
                                        {branch.email && (
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Mail size={12} className="text-gray-400" />
                                                {branch.email}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    {branch.manager_id ? (
                                        <span className="badge badge-success badge-sm">
                                            <Users size={12} className="mr-1" />
                                            Manager #{branch.manager_id}
                                        </span>
                                    ) : (
                                        <span className="badge badge-ghost badge-sm">Unassigned</span>
                                    )}
                                </td>
                                <td>
                                    <div className="text-sm text-gray-600">
                                        {branch.opening_hours || 'Not specified'}
                                    </div>
                                </td>
                                <td>
                                    {getStatusBadge(branch.is_active)}
                                </td>
                                <td>
                                    <div className="text-sm text-gray-600 flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatDate(branch.created_at)}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => onViewBranch(branch.branch_id)}
                                            className="btn btn-ghost btn-xs text-blue-600"
                                            title="View Details"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            onClick={() => onEditBranch(branch.branch_id)}
                                            className="btn btn-ghost btn-xs text-green-600"
                                            title="Edit Branch"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => onManagerBranch(branch.branch_id)}
                                            className="btn btn-ghost btn-xs text-purple-600"
                                            title="Manage Manager"
                                        >
                                            <Users size={14} />
                                        </button>
                                        <button
                                            onClick={() => onStatusBranch(branch.branch_id)}
                                            className={`btn btn-ghost btn-xs ${
                                                branch.is_active ? 'text-orange-600' : 'text-green-600'
                                            }`}
                                            title={branch.is_active ? 'Deactivate Branch' : 'Activate Branch'}
                                        >
                                            {branch.is_active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                                        </button>
                                        <button
                                            onClick={() => onDeleteBranch(branch.branch_id)}
                                            className="btn btn-ghost btn-xs text-red-600"
                                            title="Delete Branch"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredBranches.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No branches found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Showing {filteredBranches.length} of {branches.length} branches
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                        <span>Active: {branches.filter(b => b.is_active).length}</span>
                        <span>With Managers: {branches.filter(b => b.manager_id).length}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BranchOverview