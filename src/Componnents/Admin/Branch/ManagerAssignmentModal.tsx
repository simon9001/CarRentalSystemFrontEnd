// src/components/admin/ManagerAssignmentModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Users, User, UserX, Search, Check, X as XIcon, Mail, Phone, Building2 } from 'lucide-react'
import { BranchApi } from '../../../features/Api/BranchApi'
import { staffApi } from '../../../features/Api/staffApi'
import Swal from 'sweetalert2'

interface ManagerAssignmentModalProps {
    branchId: number
    onClose: () => void
    onSuccess: () => void
}

interface StaffMember {
    staff_id: number;
    username?: string;
    email?: string;
    phone_number?: string;
    role?: string;
    employee_id?: string;
    job_title?: string;
    department?: string;
    employment_type?: string;
    termination_date?: string | null;
    branch_id?: number | null;
    hire_date?: string;
    salary?: number | null;
    permissions?: string | null;
    assigned_vehicles?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
    branch_name?: string;
    user_active?: boolean;
    full_name?: string;
    branch_city?: string;
}

const ManagerAssignmentModal: React.FC<ManagerAssignmentModalProps> = ({ branchId, onClose, onSuccess }) => {
    const { data: branch } = BranchApi.useGetBranchByIdQuery(branchId)
    
    // FIX: Provide the required argument - using undefined as the first argument
    const { data: staffResponse, isLoading: staffLoading } = staffApi.useGetActiveStaffQuery(undefined)
    
    const [updateBranchManager] = BranchApi.useUpdateBranchManagerMutation()
    const [removeBranchManager] = BranchApi.useRemoveBranchManagerMutation()
    
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedManager, setSelectedManager] = useState<number | null>(null)
    const [action, setAction] = useState<'assign' | 'remove'>('assign')

    // Extract staff data from API response
    const availableStaff: StaffMember[] = staffResponse?.success ? staffResponse.data : (Array.isArray(staffResponse) ? staffResponse : [])

    useEffect(() => {
        if (branch) {
            setSelectedManager(branch.manager_id)
            setAction(branch.manager_id ? 'remove' : 'assign')
        }
    }, [branch])

    // Filter available staff for manager assignment
    const filteredStaff = availableStaff?.filter(staff =>
        !staff.termination_date && // Only active staff
        staff.staff_id !== branch?.manager_id && // Exclude current manager
        (
            staff.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) || []

    // Get current manager details
    const currentManager = availableStaff?.find(staff => staff.staff_id === branch?.manager_id)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!branch) return

        if (action === 'assign' && !selectedManager) {
            Swal.fire('Error!', 'Please select a manager to assign.', 'error')
            return
        }

        const result = await Swal.fire({
            title: action === 'assign' ? 'Assign Manager?' : 'Remove Manager?',
            text: action === 'assign' 
                ? `Assign selected staff as manager of ${branch.branch_name}?`
                : `Remove current manager from ${branch.branch_name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: action === 'assign' ? 'Yes, assign manager!' : 'Yes, remove manager!',
            cancelButtonText: 'Cancel'
        })

        if (!result.isConfirmed) {
            return
        }

        try {
            if (action === 'assign' && selectedManager) {
                await updateBranchManager({ 
                    branch_id: branchId, 
                    manager: { manager_id: selectedManager } 
                }).unwrap()
            } else if (action === 'remove') {
                await removeBranchManager(branchId).unwrap()
            }
            
            Swal.fire(
                'Success!', 
                action === 'assign' ? 'Manager assigned successfully!' : 'Manager removed successfully!',
                'success'
            )
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Manager assignment error:', error)
            Swal.fire('Error!', 'Failed to update manager assignment.', 'error')
        }
    }

    if (!branch) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-purple-600" size={24} />
                        Manager Assignment
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {/* Branch Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="text-center">
                                <h3 className="font-semibold text-gray-800">{branch.branch_name}</h3>
                                <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                                    <Building2 size={14} />
                                    {branch.city} • {branch.address}
                                </p>
                                <div className="mt-2">
                                    {currentManager ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                            <User size={14} />
                                            Currently managed by {currentManager.username || currentManager.full_name || 'Unknown'}
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                            <UserX size={14} />
                                            No manager assigned
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Selection */}
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">Action</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="action"
                                        value="assign"
                                        checked={action === 'assign'}
                                        onChange={(e) => setAction(e.target.value as 'assign' | 'remove')}
                                        className="hidden"
                                    />
                                    <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                                        action === 'assign'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                    }`}>
                                        <div className="flex items-center justify-center gap-1">
                                            <User size={16} />
                                            <span className="font-medium">Assign Manager</span>
                                        </div>
                                    </div>
                                </label>
                                <label className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="action"
                                        value="remove"
                                        checked={action === 'remove'}
                                        onChange={(e) => setAction(e.target.value as 'assign' | 'remove')}
                                        className="hidden"
                                        disabled={!branch.manager_id}
                                    />
                                    <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                                        action === 'remove'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : `border-gray-200 ${!branch.manager_id ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-600 hover:border-gray-300'}`
                                    }`}>
                                        <div className="flex items-center justify-center gap-1">
                                            <UserX size={16} />
                                            <span className="font-medium">Remove Manager</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Manager Selection (only show for assign action) */}
                        {action === 'assign' && (
                            <div className="form-control mb-6">
                                <label className="label">
                                    <span className="label-text font-semibold">Select Manager</span>
                                </label>
                                
                                {/* Search */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search staff by name, email, or position..."
                                        className="input input-bordered w-full pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Staff List */}
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {staffLoading ? (
                                        <div className="flex justify-center py-4">
                                            <span className="loading loading-spinner loading-sm text-purple-600"></span>
                                        </div>
                                    ) : filteredStaff.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">
                                            {searchTerm ? 'No matching staff found' : 'No available staff found'}
                                        </div>
                                    ) : (
                                        filteredStaff.map((staff) => (
                                            <label key={staff.staff_id} className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-purple-300">
                                                <input
                                                    type="radio"
                                                    name="manager"
                                                    value={staff.staff_id}
                                                    checked={selectedManager === staff.staff_id}
                                                    onChange={() => setSelectedManager(staff.staff_id)}
                                                    className="radio radio-primary"
                                                />
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <User className="text-purple-600" size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-800">
                                                            {staff.username || staff.full_name || 'Unknown Staff'}
                                                        </div>
                                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                                            {staff.job_title && (
                                                                <span>{staff.job_title}</span>
                                                            )}
                                                            {staff.department && (
                                                                <span className="badge badge-outline badge-sm">
                                                                    {staff.department}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                            {staff.email && (
                                                                <span className="flex items-center gap-1">
                                                                    <Mail size={12} />
                                                                    {staff.email}
                                                                </span>
                                                            )}
                                                            {staff.employee_id && (
                                                                <span className="flex items-center gap-1">
                                                                    <Users size={12} />
                                                                    {staff.employee_id}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectedManager === staff.staff_id && (
                                                        <Check className="text-green-500" size={20} />
                                                    )}
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Current Manager Info (only show for remove action) */}
                        {action === 'remove' && currentManager && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-yellow-800 mb-2">Current Manager</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <User className="text-yellow-600" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800">
                                            {currentManager.username || currentManager.full_name || 'Unknown Staff'}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {currentManager.job_title && `${currentManager.job_title}`}
                                            {currentManager.department && currentManager.job_title && ` • ${currentManager.department}`}
                                            {currentManager.department && !currentManager.job_title && currentManager.department}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                            {currentManager.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {currentManager.email}
                                                </span>
                                            )}
                                            {currentManager.employee_id && (
                                                <span className="flex items-center gap-1">
                                                    <Users size={12} />
                                                    ID: {currentManager.employee_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Confirmation Message */}
                        <div className={`rounded-lg p-4 ${
                            action === 'assign' ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'
                        }`}>
                            <div className="flex items-center gap-2">
                                <Users size={16} className={
                                    action === 'assign' ? 'text-blue-600' : 'text-red-600'
                                } />
                                <span className={`font-medium ${
                                    action === 'assign' ? 'text-blue-700' : 'text-red-700'
                                }`}>
                                    {action === 'assign' 
                                        ? selectedManager 
                                            ? `Assign selected staff as manager of ${branch.branch_name}`
                                            : 'Select a staff member to assign as manager'
                                        : `Remove current manager from ${branch.branch_name}`
                                    }
                                </span>
                            </div>
                            <p className={`text-sm mt-1 ${
                                action === 'assign' ? 'text-blue-600' : 'text-red-600'
                            }`}>
                                {action === 'assign'
                                    ? 'The assigned manager will have administrative access to this branch.'
                                    : 'This branch will no longer have a designated manager.'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn ${
                                action === 'assign' ? 'btn-success' : 'btn-error'
                            }`}
                            disabled={action === 'assign' && !selectedManager}
                        >
                            {action === 'assign' ? 'Assign Manager' : 'Remove Manager'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ManagerAssignmentModal