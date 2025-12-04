// src/components/admin/RoleManagementModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Shield, User, Crown, Briefcase, UserCheck } from 'lucide-react'
import Swal from 'sweetalert2'
import { UserApi } from '../../../features/Api/UsersApi.ts'

interface RoleManagementModalProps {
    userId: number
    onClose: () => void
    onSuccess: () => void
}

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({ userId, onClose, onSuccess }) => {
    const { data: user } = UserApi.useGetUserByIdQuery(userId)
    const [updateUserRole] = UserApi.useUpdateUserMutation()
    
    const [selectedRole, setSelectedRole] = useState('Customer')
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState('')

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role)
        }
    }, [user])

    const roleOptions = [
        {
            value: 'Customer',
            label: 'Customer',
            description: 'Regular user with basic permissions',
            icon: User,
            color: 'bg-green-100 text-green-600'
        },
        {
            value: 'Agent',
            label: 'Agent',
            description: 'Can manage bookings and customer interactions',
            icon: UserCheck,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            value: 'Manager',
            label: 'Manager',
            description: 'Can manage agents and view reports',
            icon: Briefcase,
            color: 'bg-yellow-100 text-yellow-600'
        },
        {
            value: 'Admin',
            label: 'Administrator',
            description: 'Full system access including user management',
            icon: Crown,
            color: 'bg-red-100 text-red-600'
        }
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!user) return

        if (selectedRole === user.role) {
            Swal.fire('Info!', 'No role change detected.', 'info')
            return
        }

        // Require reason for role escalation (optional)
        if ((selectedRole === 'Admin' || selectedRole === 'Manager') && !reason.trim()) {
            Swal.fire('Warning!', 'Please provide a reason for granting elevated permissions.', 'warning')
            return
        }

        // Show confirmation for role changes
        const result = await Swal.fire({
            title: 'Change User Role?',
            html: `
                <div class="text-left">
                    <p>You are changing <strong>${user.username}</strong>'s role from:</p>
                    <p class="font-bold text-lg text-center my-2">${user.role} → ${selectedRole}</p>
                    <p class="text-sm text-gray-600 mt-4">This will affect their system permissions immediately.</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Update Role',
            reverseButtons: true
        })

        if (!result.isConfirmed) return

        setLoading(true)
        try {
            await updateUserRole({
                userId,
                role: selectedRole
            }).unwrap()
            
            // Log the role change (you might want to send this to your API)
            console.log(`User ${userId} role changed from ${user.role} to ${selectedRole}. Reason: ${reason}`)
            
            onSuccess()
        } catch (error: any) {
            Swal.fire('Error!', error.data?.error || 'Failed to update user role', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Shield className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Manage User Role</h2>
                                <p className="text-gray-600">Update permissions for {user.username}</p>
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
                        {/* Current Role */}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="font-medium text-gray-800 mb-2">Current Role</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const currentRole = roleOptions.find(r => r.value === user.role)
                                        const Icon = currentRole?.icon || User
                                        return (
                                            <div className={`p-2 rounded-lg ${currentRole?.color || 'bg-gray-100'}`}>
                                                <Icon size={20} />
                                            </div>
                                        )
                                    })()}
                                    <div>
                                        <p className="font-semibold text-gray-800">{user.role}</p>
                                        <p className="text-sm text-gray-600">
                                            {roleOptions.find(r => r.value === user.role)?.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-800">Select New Role</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {roleOptions.map((role) => {
                                    const Icon = role.icon
                                    const isSelected = selectedRole === role.value
                                    
                                    return (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => setSelectedRole(role.value)}
                                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                isSelected 
                                                    ? `${role.color.replace('bg-', 'border-')} border-2 bg-white` 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${role.color}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div>
                                                    <p className={`font-semibold ${
                                                        isSelected ? 'text-gray-800' : 'text-gray-700'
                                                    }`}>
                                                        {role.label}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {role.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Reason for Role Change */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Reason for Role Change
                                {(selectedRole === 'Admin' || selectedRole === 'Manager') && (
                                    <span className="text-red-500 ml-1">*</span>
                                )}
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="textarea textarea-bordered w-full"
                                placeholder="Please provide a reason for changing the user's role..."
                                rows={3}
                                required={selectedRole === 'Admin' || selectedRole === 'Manager'}
                            />
                            <p className="text-xs text-gray-500">
                                This will be recorded for audit purposes.
                            </p>
                        </div>

                        {/* Warning Message for Admin/Manager roles */}
                        {(selectedRole === 'Admin' || selectedRole === 'Manager') && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Shield className="text-yellow-500 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="font-medium text-yellow-800">Elevated Permissions</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Granting {selectedRole} role will give this user access to sensitive system functions.
                                            Ensure this is appropriate and necessary.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Warning for downgrading from Admin */}
                        {user.role === 'Admin' && selectedRole !== 'Admin' && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Crown className="text-red-500 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="font-medium text-red-800">Removing Admin Privileges</h4>
                                        <p className="text-sm text-red-700 mt-1">
                                            You are removing administrator privileges from this user.
                                            They will lose access to user management and other sensitive features.
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
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Updating...
                                </>
                            ) : (
                                'Update Role'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RoleManagementModal