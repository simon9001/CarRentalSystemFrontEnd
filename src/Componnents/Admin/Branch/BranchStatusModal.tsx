// src/components/admin/BranchStatusModal.tsx
import React, { useState, useEffect } from 'react'
import { X, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle, PauseCircle } from 'lucide-react'
import { BranchApi } from '../../../features/Api/BranchApi'
import Swal from 'sweetalert2'

interface BranchStatusModalProps {
    branchId: number
    onClose: () => void
    onSuccess: () => void
}

const BranchStatusModal: React.FC<BranchStatusModalProps> = ({ branchId, onClose, onSuccess }) => {
    const { data: branch } = BranchApi.useGetBranchByIdQuery(branchId)
    // const [updateBranchStatus] = BranchApi.useUpdateBranchStatusMutation()
    const [activateBranch] = BranchApi.useActivateBranchMutation()
    const [deactivateBranch] = BranchApi.useDeactivateBranchMutation()
    
    const [newStatus, setNewStatus] = useState<boolean>(true)

    useEffect(() => {
        if (branch) {
            setNewStatus(branch.is_active)
        }
    }, [branch])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!branch) return

        // Show confirmation for status changes
        if (newStatus !== branch.is_active) {
            const action = newStatus ? 'activate' : 'deactivate'
            const title = newStatus ? 'Activate Branch?' : 'Deactivate Branch?'
            const text = newStatus 
                ? 'Activating this branch will allow it to accept new bookings and vehicle assignments.'
                : 'Deactivating this branch will prevent new bookings and may affect existing operations.'
            const icon = newStatus ? 'question' : 'warning'

            const result = await Swal.fire({
                title,
                text,
                icon: icon as any,
                showCancelButton: true,
                confirmButtonColor: newStatus ? '#10b981' : '#d33',
                cancelButtonColor: '#6b7280',
                confirmButtonText: `Yes, ${action} it!`,
                cancelButtonText: 'Cancel'
            })

            if (!result.isConfirmed) {
                return
            }
        }

        try {
            if (newStatus !== branch.is_active) {
                if (newStatus) {
                    await activateBranch(branchId).unwrap()
                } else {
                    await deactivateBranch(branchId).unwrap()
                }
                onSuccess()
            } else {
                Swal.fire('Info!', 'No changes made to branch status.', 'info')
                onClose()
            }
        } catch (error) {
            Swal.fire('Error!', 'Failed to update branch status.', 'error')
        }
    }

    if (!branch) return null

    const getStatusIcon = (status: boolean) => {
        return status ? (
            <CheckCircle className="text-green-500" size={20} />
        ) : (
            <PauseCircle className="text-red-500" size={20} />
        )
    }

    const getStatusDescription = (status: boolean) => {
        return status 
            ? 'Branch can accept bookings and vehicle assignments.'
            : 'Branch is temporarily closed and cannot accept new bookings.'
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {branch.is_active ? <ToggleRight className="text-green-600" size={24} /> : <ToggleLeft className="text-red-600" size={24} />}
                        Branch Status
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        {/* Branch Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="text-center">
                                <h3 className="font-semibold text-gray-800">{branch.branch_name}</h3>
                                <p className="text-sm text-gray-600">{branch.city}</p>
                                <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                    branch.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {getStatusIcon(branch.is_active)}
                                    Current: {branch.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>

                        {/* Status Selection */}
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">New Branch Status</span>
                            </label>
                            <div className="space-y-2">
                                {[true, false].map((status) => (
                                    <label key={status.toString()} className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-blue-300">
                                        <input
                                            type="radio"
                                            name="branch_status"
                                            checked={newStatus === status}
                                            onChange={() => setNewStatus(status)}
                                            className="radio radio-primary"
                                        />
                                        <div className="flex items-center gap-2 flex-1">
                                            {getStatusIcon(status)}
                                            <div>
                                                <div className="font-medium">
                                                    {status ? 'Active' : 'Inactive'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {getStatusDescription(status)}
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Warning for status changes */}
                        {newStatus !== branch.is_active && (
                            <div className={`rounded-lg p-4 mb-6 ${
                                newStatus ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={16} className={
                                        newStatus ? 'text-green-600' : 'text-red-600'
                                    } />
                                    <span className={`font-medium ${
                                        newStatus ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                        Changing from {branch.is_active ? 'Active' : 'Inactive'} to {newStatus ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className={`text-sm mt-1 ${
                                    newStatus ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {getStatusDescription(newStatus)}
                                </p>
                            </div>
                        )}
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
                                newStatus ? 'btn-success' : 'btn-error'
                            }`}
                            disabled={newStatus === branch.is_active}
                        >
                            {newStatus ? 'Activate Branch' : 'Deactivate Branch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default BranchStatusModal