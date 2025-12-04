// src/components/admin/DeleteBranchModal.tsx
import React, { useState } from 'react'
import { X, AlertTriangle, Building2, Car, Users, Calendar } from 'lucide-react'
import { BranchApi } from '../../../features/Api/BranchApi'
import Swal from 'sweetalert2'

interface DeleteBranchModalProps {
    branchId: number
    onClose: () => void
    onSuccess: () => void
}

const DeleteBranchModal: React.FC<DeleteBranchModalProps> = ({ branchId, onClose, onSuccess }) => {
    const { data: branch } = BranchApi.useGetBranchByIdQuery(branchId)
    const { data: statistics } = BranchApi.useGetBranchStatisticsQuery(branchId)
    const [deleteBranch] = BranchApi.useDeleteBranchMutation()
    
    const [confirmationText, setConfirmationText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!branch) return

        if (confirmationText !== branch.branch_name) {
            Swal.fire('Error!', `Please type "${branch.branch_name}" to confirm deletion.`, 'error')
            return
        }

        // Check for active dependencies
        const hasDependencies = 
            (statistics?.vehicle_count || 0) > 0 ||
            (statistics?.staff_count || 0) > 0 ||
            (statistics?.active_bookings || 0) > 0

        if (hasDependencies) {
            const result = await Swal.fire({
                title: 'Cannot Delete Branch',
                html: `
                    <div class="text-left">
                        <p>This branch cannot be deleted because it has active dependencies:</p>
                        <div class="mt-3 space-y-1 text-sm">
                            ${statistics?.vehicle_count ? `<div>• ${statistics.vehicle_count} assigned vehicles</div>` : ''}
                            ${statistics?.staff_count ? `<div>• ${statistics.staff_count} assigned staff</div>` : ''}
                            ${statistics?.active_bookings ? `<div>• ${statistics.active_bookings} active bookings</div>` : ''}
                        </div>
                        <p class="mt-3 text-yellow-600">Please reassign or remove these dependencies before deleting the branch.</p>
                    </div>
                `,
                icon: 'error',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Understood'
            })
            return
        }

        setIsDeleting(true)

        try {
            await deleteBranch(branchId).unwrap()
            onSuccess()
        } catch (error) {
            Swal.fire('Error!', 'Failed to delete branch.', 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    if (!branch) return null

    const hasDependencies = 
        (statistics?.vehicle_count || 0) > 0 ||
        (statistics?.staff_count || 0) > 0 ||
        (statistics?.active_bookings || 0) > 0

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="text-red-600" size={24} />
                        Delete Branch
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        {/* Warning Banner */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 text-red-700">
                                <AlertTriangle size={20} />
                                <span className="font-semibold">Danger Zone</span>
                            </div>
                            <p className="text-sm text-red-600 mt-1">
                                This action cannot be undone. All branch data will be permanently deleted.
                            </p>
                        </div>

                        {/* Branch Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="text-center">
                                <Building2 className="mx-auto text-gray-400 mb-2" size={32} />
                                <h3 className="font-semibold text-gray-800">{branch.branch_name}</h3>
                                <p className="text-sm text-gray-600">{branch.city}</p>
                                <p className="text-xs text-gray-500 mt-1">{branch.address}</p>
                            </div>
                        </div>

                        {/* Dependencies Check */}
                        {hasDependencies && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-yellow-800 mb-3">Active Dependencies</h4>
                                <div className="space-y-2">
                                    {statistics?.vehicle_count > 0 && (
                                        <div className="flex items-center gap-2 text-yellow-700">
                                            <Car size={16} />
                                            <span>{statistics.vehicle_count} assigned vehicles</span>
                                        </div>
                                    )}
                                    {statistics?.staff_count > 0 && (
                                        <div className="flex items-center gap-2 text-yellow-700">
                                            <Users size={16} />
                                            <span>{statistics.staff_count} assigned staff</span>
                                        </div>
                                    )}
                                    {statistics?.active_bookings > 0 && (
                                        <div className="flex items-center gap-2 text-yellow-700">
                                            <Calendar size={16} />
                                            <span>{statistics.active_bookings} active bookings</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-yellow-600 mt-2">
                                    Please resolve these dependencies before deleting the branch.
                                </p>
                            </div>
                        )}

                        {/* Confirmation Input */}
                        {!hasDependencies && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">
                                        Type <span className="text-red-600 font-mono">"{branch.branch_name}"</span> to confirm
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    className="input input-bordered"
                                    placeholder={`Enter "${branch.branch_name}"`}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-error"
                            disabled={hasDependencies || confirmationText !== branch.branch_name || isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Deleting...
                                </>
                            ) : (
                                'Delete Branch'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DeleteBranchModal