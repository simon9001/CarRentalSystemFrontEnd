// src/components/admin/UserDetailsModal.tsx
import React from 'react'
import { X, User, Mail, Phone, Home, Shield, Lock, Calendar, Clock, AlertTriangle, Crown, Briefcase, UserCheck, Key, Edit } from 'lucide-react'
import { UserApi} from '../../../features/Api/UsersApi'

interface UserDetailsModalProps {
    userId: number
    onClose: () => void
    onEdit: () => void
    onVerify: () => void
    onStatus: () => void
    onMfa: () => void
    onPassword: () => void
    onRole: () => void
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
    userId,
    onClose,
    onEdit,
    onVerify,
    onStatus,
    onMfa,
    onPassword,
    onRole
}) => {
    const { data: user, isLoading } = UserApi.useGetUserByIdQuery(userId)

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    // Role icon and color mapping
    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'Admin':
                return { icon: Crown, color: 'text-red-500 bg-red-50' }
            case 'Manager':
                return { icon: Briefcase, color: 'text-yellow-500 bg-yellow-50' }
            case 'Agent':
                return { icon: UserCheck, color: 'text-blue-500 bg-blue-50' }
            case 'Customer':
                return { icon: User, color: 'text-green-500 bg-green-50' }
            default:
                return { icon: User, color: 'text-gray-500 bg-gray-50' }
        }
    }

    const roleConfig = getRoleIcon(user.role)
    const RoleIcon = roleConfig.icon

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate max-w-[200px] sm:max-w-none">
                                    {user.username}
                                </h2>
                                <p className="text-sm text-gray-600">User Details</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-circle btn-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                        {/* Personal Information */}
                        <div className="space-y-4 sm:space-y-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                Personal Information
                            </h3>
                            
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">Username</span>
                                    </div>
                                    <span className="font-mono text-sm sm:text-base truncate">{user.username}</span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">Email</span>
                                    </div>
                                    <span className="text-sm sm:text-base truncate">{user.email}</span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">Phone</span>
                                    </div>
                                    <span className="text-sm sm:text-base">{user.phone_number || 'Not provided'}</span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                                    <div className="flex items-center gap-2">
                                        <Home className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">Address</span>
                                    </div>
                                    <span className="text-sm sm:text-base text-right break-words max-w-[200px]">
                                        {user.address || 'Not provided'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4 sm:space-y-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                                Account Information
                            </h3>
                            
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">User ID</span>
                                    <span className="font-mono text-sm sm:text-base">#{user.user_id}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Role</span>
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${roleConfig.color}`}>
                                            <RoleIcon className="w-4 h-4" />
                                        </div>
                                        <span className={`badge ${
                                            user.role === 'Admin' ? 'badge-error' :
                                            user.role === 'Manager' ? 'badge-warning' :
                                            user.role === 'Agent' ? 'badge-info' :
                                            'badge-success'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Status</span>
                                    <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">MFA</span>
                                    <span className={`badge ${user.mfa_enabled ? 'badge-success' : 'badge-ghost'}`}>
                                        {user.mfa_enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Security Information */}
                        <div className="space-y-4 sm:space-y-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                                Security Information
                            </h3>
                            
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Email Verified</span>
                                    <span className={`badge ${user.is_email_verified ? 'badge-success' : 'badge-warning'}`}>
                                        {user.is_email_verified ? 'Yes' : 'No'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Phone Verified</span>
                                    <span className={`badge ${user.is_phone_verified ? 'badge-success' : 'badge-ghost'}`}>
                                        {user.is_phone_verified ? 'Yes' : 'No'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Failed Logins</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold text-sm sm:text-base ${
                                            user.failed_login_attempts >= 3 ? 'text-red-600' :
                                            user.failed_login_attempts >= 1 ? 'text-yellow-600' : 'text-gray-600'
                                        }`}>
                                            {user.failed_login_attempts}
                                        </span>
                                        {user.failed_login_attempts >= 3 && (
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Lockout Status</span>
                                    <span className={`badge ${user.lockout_end ? 'badge-error' : 'badge-success'}`}>
                                        {user.lockout_end ? 'Locked' : 'Not Locked'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="space-y-4 sm:space-y-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                Timestamps
                            </h3>
                            
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-sm sm:text-base">Created At</span>
                                    </div>
                                    <span className="text-xs sm:text-sm">
                                        {new Date(user.created_at).toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-sm sm:text-base">Updated At</span>
                                    </div>
                                    <span className="text-xs sm:text-sm">
                                        {new Date(user.updated_at).toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-sm sm:text-base">Last Login</span>
                                    </div>
                                    <span className="text-xs sm:text-sm">
                                        {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-sm sm:text-base">Password Changed</span>
                                    </div>
                                    <span className="text-xs sm:text-sm">
                                        {new Date(user.password_changed_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                        <button
                            onClick={onEdit}
                            className="btn btn-outline btn-success btn-sm sm:btn-md"
                            title="Edit User"
                        >
                            <Edit className="w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                            onClick={onRole}
                            className="btn btn-outline btn-primary btn-sm sm:btn-md"
                            title="Change Role"
                        >
                            <Crown className="w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Role</span>
                        </button>
                        <button
                            onClick={onVerify}
                            className="btn btn-outline btn-info btn-sm sm:btn-md"
                            title="Verification"
                        >
                            <UserCheck className="w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Verify</span>
                        </button>
                        <button
                            onClick={onStatus}
                            className="btn btn-outline btn-warning btn-sm sm:btn-md"
                            title="Account Status"
                        >
                            <Lock className="w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Status</span>
                        </button>
                        <button
                            onClick={onMfa}
                            className="btn btn-outline btn-secondary btn-sm sm:btn-md"
                            title="MFA Settings"
                        >
                            <Shield className="w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">MFA</span>
                        </button>
                        <button
                            onClick={onPassword}
                            className="btn btn-outline btn-accent btn-sm sm:btn-md"
                            title="Reset Password"
                        >
                            <Key className="w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Password</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-sm sm:btn-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserDetailsModal