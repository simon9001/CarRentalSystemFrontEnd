// src/components/admin/AccountStatusModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Lock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { UserApi } from  '../../../features/Api/UsersApi.ts'
import Swal from 'sweetalert2'
// import { UpdateStatusRequest } from '../../../types/UserTypes'

interface AccountStatusModalProps {
    userId: number
    onClose: () => void
    onSuccess: () => void
}

const AccountStatusModal: React.FC<AccountStatusModalProps> = ({ userId, onClose, onSuccess }) => {
    const { data: user } = UserApi.useGetUserByIdQuery(userId)
    const [updateStatus] = UserApi.useUpdateUserStatusMutation()
    
    const [isActive, setIsActive] = useState(true)
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState('')

    useEffect(() => {
        if (user) {
            setIsActive(user.is_active)
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!user) return

        if (isActive === user.is_active) {
            Swal.fire('Info!', 'No changes detected.', 'info')
            return
        }

        // Show confirmation for deactivation
        if (!isActive && !reason.trim()) {
            Swal.fire('Warning!', 'Please provide a reason for deactivation.', 'warning')
            return
        }

        if (!isActive) {
            const result = await Swal.fire({
                title: 'Deactivate Account?',
                text: `This will deactivate ${user.username}'s account. They will not be able to login.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, deactivate!',
                reverseButtons: true
            })

            if (!result.isConfirmed) return
        }

        setLoading(true)
        try {
            await updateStatus({
                userId,
                data: { is_active: isActive }
            }).unwrap()
            
            // Log the reason for deactivation (you might want to send this to your API)
            if (!isActive) {
                console.log(`Account ${userId} deactivated. Reason: ${reason}`)
            }
            
            onSuccess()
        } catch (error: any) {
            Swal.fire('Error!', error.data?.error || 'Failed to update account status', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                                <Lock className={isActive ? 'text-green-600' : 'text-red-600'} size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Account Status</h2>
                                <p className="text-gray-600">Update status for {user.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-circle"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Current Status */}
                        <div className={`p-4 rounded-lg border ${
                            user.is_active 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                {user.is_active ? (
                                    <CheckCircle className="text-green-500" size={20} />
                                ) : (
                                    <XCircle className="text-red-500" size={20} />
                                )}
                                <div>
                                    <h3 className="font-medium text-gray-800">Current Status</h3>
                                    <p className={`text-sm font-medium ${
                                        user.is_active ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Selection */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-800">Set Account Status</h3>
                            
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsActive(true)}
                                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                        isActive 
                                            ? 'border-green-500 bg-green-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 justify-center">
                                        <CheckCircle className={isActive ? 'text-green-500' : 'text-gray-400'} size={20} />
                                        <span className={isActive ? 'font-medium text-green-700' : 'text-gray-700'}>
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 text-center">
                                        User can login and use the system
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsActive(false)}
                                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                        !isActive 
                                            ? 'border-red-500 bg-red-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 justify-center">
                                        <XCircle className={!isActive ? 'text-red-500' : 'text-gray-400'} size={20} />
                                        <span className={!isActive ? 'font-medium text-red-700' : 'text-gray-700'}>
                                            Inactive
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 text-center">
                                        User cannot login
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Reason for Deactivation */}
                        {!isActive && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    <AlertTriangle size={16} className="inline mr-2 text-yellow-500" />
                                    Reason for Deactivation *
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="textarea textarea-bordered w-full"
                                    placeholder="Please provide a reason for deactivating this account..."
                                    rows={3}
                                    required={!isActive}
                                />
                                <p className="text-xs text-gray-500">
                                    This will be recorded for audit purposes.
                                </p>
                            </div>
                        )}

                        {/* Warning Message */}
                        {!isActive && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-yellow-500 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="font-medium text-yellow-800">Warning</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Deactivating this account will prevent the user from logging in.
                                            This action can be reversed at any time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn ${isActive ? 'btn-success' : 'btn-error'}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Updating...
                                </>
                            ) : (
                                `Set as ${isActive ? 'Active' : 'Inactive'}`
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AccountStatusModal