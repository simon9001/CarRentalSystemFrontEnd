// src/components/admin/BranchManagement.tsx
import React, { useState } from 'react'
import AdminDashboardLayout from '../../../dashboardDesign/AdminDashboardLayout'
import { Building2, Plus, MapPin, Users} from 'lucide-react'
import { BranchApi } from '../../../features/Api/BranchApi'
import Swal from 'sweetalert2'
import BranchOverview from './BranchOverview'
import CreateBranchModal from './CreateBranchModal'
import BranchDetailsModal from './BranchDetailsModal'
import EditBranchModal from './EditBranchModal'
import BranchStatusModal from './BranchStatusModal'
import ManagerAssignmentModal from './ManagerAssignmentModal'
import DeleteBranchModal from './DeleteBranchModal'
import CitySummary from './CitySummary'

const BranchManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'cities' | 'create'>('overview')
    // const [selectedBranch, setSelectedBranch] = useState<number | null>(null)
    const [viewBranch, setViewBranch] = useState<number | null>(null)
    const [editBranch, setEditBranch] = useState<number | null>(null)
    const [statusBranch, setStatusBranch] = useState<number | null>(null)
    const [managerBranch, setManagerBranch] = useState<number | null>(null)
    const [deleteBranch, setDeleteBranch] = useState<number | null>(null)
    
    // RTK Query hooks
    const { data: branches, isLoading, error } = BranchApi.useGetAllBranchesQuery()
    const { data: summary } = BranchApi.useGetBranchSummaryQuery()

    return (
        <AdminDashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Branch Management</h1>
                        <p className="text-gray-600">Manage your rental locations and operations</p>
                    </div>
                </div>
                
                <button
                    onClick={() => setActiveTab('create')}
                    className="btn btn-primary gap-2"
                >
                    <Plus size={20} />
                    Add New Branch
                </button>
            </div>

            {/* Summary Statistics */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Branches</p>
                                <p className="text-2xl font-bold text-gray-800">{summary.total_branches}</p>
                            </div>
                            <Building2 className="text-blue-500" size={24} />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">{summary.active_branches}</p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Inactive</p>
                                <p className="text-2xl font-bold text-red-600">{summary.inactive_branches}</p>
                            </div>
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Cities</p>
                                <p className="text-2xl font-bold text-purple-600">{summary.cities_covered}</p>
                            </div>
                            <MapPin className="text-purple-500" size={24} />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">With Managers</p>
                                <p className="text-2xl font-bold text-green-600">{summary.branches_with_managers}</p>
                            </div>
                            <Users className="text-green-500" size={24} />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">No Managers</p>
                                <p className="text-2xl font-bold text-yellow-600">{summary.branches_without_managers}</p>
                            </div>
                            <Users className="text-yellow-500" size={24} />
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Branch Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('cities')}
                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'cities'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            City Summary
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'create'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Add Branch
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <BranchOverview
                    branches={branches || []}
                    isLoading={isLoading}
                    error={error}
                    onViewBranch={setViewBranch}
                    onEditBranch={setEditBranch}
                    onStatusBranch={setStatusBranch}
                    onManagerBranch={setManagerBranch}
                    onDeleteBranch={setDeleteBranch}
                />
            )}

            {activeTab === 'cities' && (
                <CitySummary />
            )}

            {activeTab === 'create' && (
                <CreateBranchModal
                    onClose={() => setActiveTab('overview')}
                    onSuccess={() => {
                        setActiveTab('overview')
                        Swal.fire('Success!', 'Branch created successfully.', 'success')
                    }}
                />
            )}

            {/* Modals */}
            {viewBranch && (
                <BranchDetailsModal
                    branchId={viewBranch}
                    onClose={() => setViewBranch(null)}
                    onEdit={() => {
                        setEditBranch(viewBranch)
                        setViewBranch(null)
                    }}
                    onStatus={() => {
                        setStatusBranch(viewBranch)
                        setViewBranch(null)
                    }}
                    onManager={() => {
                        setManagerBranch(viewBranch)
                        setViewBranch(null)
                    }}
                    onDelete={() => {
                        setDeleteBranch(viewBranch)
                        setViewBranch(null)
                    }}
                />
            )}

            {editBranch && (
                <EditBranchModal
                    branchId={editBranch}
                    onClose={() => setEditBranch(null)}
                    onSuccess={() => {
                        setEditBranch(null)
                        Swal.fire('Success!', 'Branch updated successfully.', 'success')
                    }}
                />
            )}

            {statusBranch && (
                <BranchStatusModal
                    branchId={statusBranch}
                    onClose={() => setStatusBranch(null)}
                    onSuccess={() => {
                        setStatusBranch(null)
                        Swal.fire('Success!', 'Branch status updated.', 'success')
                    }}
                />
            )}

            {managerBranch && (
                <ManagerAssignmentModal
                    branchId={managerBranch}
                    onClose={() => setManagerBranch(null)}
                    onSuccess={() => {
                        setManagerBranch(null)
                        Swal.fire('Success!', 'Manager assignment updated.', 'success')
                    }}
                />
            )}

            {deleteBranch && (
                <DeleteBranchModal
                    branchId={deleteBranch}
                    onClose={() => setDeleteBranch(null)}
                    onSuccess={() => {
                        setDeleteBranch(null)
                        Swal.fire('Success!', 'Branch deleted successfully.', 'success')
                    }}
                />
            )}
        </AdminDashboardLayout>
    )
}

export default BranchManagement