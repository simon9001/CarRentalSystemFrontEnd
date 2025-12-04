// src/components/admin/UserOverview.tsx
import React, { useState, useMemo } from 'react'
import { Search, Eye, Edit, Shield, Lock, Mail, Phone, UserCheck, Trash2, User, Home, Calendar, Crown } from 'lucide-react'
import { type UserResponse } from '../../../types/UserTypes'
import Swal from 'sweetalert2'
import { UserApi } from '../../../features/Api/UsersApi.ts'

interface UserOverviewProps {
    users: UserResponse[]
    isLoading: boolean
    error: any
    onViewUser: (id: number) => void
    onEditUser: (id: number) => void
    onVerifyUser: (id: number) => void
    onStatusUser: (id: number) => void
    onMfaUser: (id: number) => void
    onPasswordUser: (id: number) => void
    onRoleUser: (id: number) => void
}

const UserOverview: React.FC<UserOverviewProps> = ({
    users,
    isLoading,
    error,
    onViewUser,
    onEditUser,
    onVerifyUser,
    onStatusUser,
    onMfaUser,
    onPasswordUser,
    onRoleUser
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [verificationFilter, setVerificationFilter] = useState('all')
    const [mfaFilter, setMfaFilter] = useState('all')
    const [mobileView, setMobileView] = useState<'table' | 'cards'>('table')

    const [deleteUser] = UserApi.useDeleteUserMutation()

    // Filter users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = 
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.address?.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesRole = roleFilter === 'all' || user.role === roleFilter
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && user.is_active) ||
                (statusFilter === 'inactive' && !user.is_active)
            const matchesVerification = verificationFilter === 'all' || 
                (verificationFilter === 'verified' && user.is_email_verified) ||
                (verificationFilter === 'unverified' && !user.is_email_verified)
            const matchesMfa = mfaFilter === 'all' || 
                (mfaFilter === 'enabled' && user.mfa_enabled) ||
                (mfaFilter === 'disabled' && !user.mfa_enabled)

            return matchesSearch && matchesRole && matchesStatus && matchesVerification && matchesMfa
        })
    }, [users, searchTerm, roleFilter, statusFilter, verificationFilter, mfaFilter])

    // Get status badge
    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <span className="badge badge-success badge-xs sm:badge-sm">Active</span>
        ) : (
            <span className="badge badge-error badge-xs sm:badge-sm">Inactive</span>
        )
    }

    const getVerificationBadge = (isVerified: boolean) => {
        return isVerified ? (
            <span className="badge badge-success badge-xs sm:badge-sm">Verified</span>
        ) : (
            <span className="badge badge-warning badge-xs sm:badge-sm">Pending</span>
        )
    }

    const getRoleBadge = (role: string) => {
        const roleColors: Record<string, string> = {
            'Admin': 'badge-error',
            'Manager': 'badge-warning',
            'Agent': 'badge-info',
            'Customer': 'badge-success'
        }
        return <span className={`badge ${roleColors[role] || 'badge-ghost'} badge-xs sm:badge-sm`}>{role}</span>
    }

    // Get lock status
    const getLockStatus = (lockoutEnd: string | null, failedAttempts: number) => {
        if (lockoutEnd && new Date(lockoutEnd) > new Date()) {
            return { status: 'Locked', class: 'bg-red-50', attempts: failedAttempts }
        } else if (failedAttempts >= 3) {
            return { status: 'Warning', class: 'bg-yellow-50', attempts: failedAttempts }
        }
        return { status: 'Normal', class: '', attempts: failedAttempts }
    }

    // Handle delete
    const handleDeleteUser = async (userId: number, username: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `This will permanently delete user "${username}"!`,
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            reverseButtons: true
        })

        if (result.isConfirmed) {
            try {
                await deleteUser(userId).unwrap()
                Swal.fire('Deleted!', 'User has been deleted.', 'success')
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete user.', 'error')
            }
        }
    }

    // Mobile card view for user
    const UserCard = ({ user }: { user: UserResponse }) => {
        const lockStatus = getLockStatus(user.lockout_end, user.failed_login_attempts)
        
        return (
            <div className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow ${lockStatus.class}`}>
                {/* User Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800 truncate">{user.username}</h3>
                            {getRoleBadge(user.role)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onViewUser(user.user_id)}
                            className="btn btn-ghost btn-xs text-blue-600"
                            title="View Details"
                        >
                            <Eye className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => onRoleUser(user.user_id)}
                            className="btn btn-ghost btn-xs text-purple-600"
                            title="Change Role"
                        >
                            <Crown className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => handleDeleteUser(user.user_id, user.username)}
                            className="btn btn-ghost btn-xs text-red-600"
                            title="Delete User"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone_number && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {user.phone_number}
                        </div>
                    )}
                </div>

                {/* Status & Security */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                        <div className="font-medium text-gray-700">Status</div>
                        <div>{getStatusBadge(user.is_active)}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium text-gray-700">Verification</div>
                        <div>{getVerificationBadge(user.is_email_verified)}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium text-gray-700">Security</div>
                        <div className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>{lockStatus.status}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium text-gray-700">Last Login</div>
                        <div className="text-gray-600">
                            {user.last_login ? 
                                new Date(user.last_login).toLocaleDateString() : 
                                'Never'
                            }
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                    <button
                        onClick={() => onEditUser(user.user_id)}
                        className="btn btn-ghost btn-xs text-green-600"
                        title="Edit"
                    >
                        <Edit className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onVerifyUser(user.user_id)}
                        className="btn btn-ghost btn-xs text-purple-600"
                        title="Verify"
                    >
                        <UserCheck className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onStatusUser(user.user_id)}
                        className="btn btn-ghost btn-xs text-orange-600"
                        title="Status"
                    >
                        <Lock className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onMfaUser(user.user_id)}
                        className="btn btn-ghost btn-xs text-indigo-600"
                        title="MFA"
                    >
                        <Shield className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onPasswordUser(user.user_id)}
                        className="btn btn-ghost btn-xs text-yellow-600"
                        title="Password"
                    >
                        <Lock className="w-3 h-3" />
                    </button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">Error Loading Users</h3>
                <p className="text-red-600 text-sm">Unable to fetch users. Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Filters & View Toggle */}
            <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="input input-bordered w-full pl-9 sm:pl-10 text-sm sm:text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Mobile View Toggle */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <span className="text-xs text-gray-600">View:</span>
                        <div className="btn-group">
                            <button
                                className={`btn btn-xs ${mobileView === 'table' ? 'btn-active' : ''}`}
                                onClick={() => setMobileView('table')}
                            >
                                Table
                            </button>
                            <button
                                className={`btn btn-xs ${mobileView === 'cards' ? 'btn-active' : ''}`}
                                onClick={() => setMobileView('cards')}
                            >
                                Cards
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        <select 
                            className="select select-bordered select-xs sm:select-sm text-xs sm:text-sm"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Agent">Agent</option>
                            <option value="Customer">Customer</option>
                        </select>

                        <select 
                            className="select select-bordered select-xs sm:select-sm text-xs sm:text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <select 
                            className="select select-bordered select-xs sm:select-sm text-xs sm:text-sm"
                            value={verificationFilter}
                            onChange={(e) => setVerificationFilter(e.target.value)}
                        >
                            <option value="all">All Verification</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                        </select>

                        <select 
                            className="select select-bordered select-xs sm:select-sm text-xs sm:text-sm"
                            value={mfaFilter}
                            onChange={(e) => setMfaFilter(e.target.value)}
                        >
                            <option value="all">All MFA</option>
                            <option value="enabled">MFA Enabled</option>
                            <option value="disabled">MFA Disabled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            {mobileView === 'cards' && (
                <div className="p-3 sm:p-4">
                    {filteredUsers.map((user) => (
                        <UserCard key={user.user_id} user={user} />
                    ))}
                    
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-400 w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-600 mb-2">No users found</h3>
                            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            )}

            {/* Desktop & Mobile Table View */}
            {(mobileView === 'table' || window.innerWidth >= 1024) && (
                <>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full min-w-[1024px] lg:min-w-0">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">User</th>
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">Contact</th>
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">Role & Status</th>
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">Verification</th>
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">Security</th>
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">Last Login</th>
                                    <th className="text-center font-semibold text-gray-700 p-3 text-xs sm:text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => {
                                    const lockStatus = getLockStatus(user.lockout_end, user.failed_login_attempts)
                                    
                                    return (
                                        <tr key={user.user_id} className={`hover:bg-gray-50 ${lockStatus.class}`}>
                                            <td className="p-3">
                                                <div>
                                                    <div className="font-bold text-gray-800 text-sm sm:text-base">{user.username}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-xs sm:text-sm">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        <span className="truncate max-w-[120px] sm:max-w-[150px]">{user.email}</span>
                                                    </div>
                                                    {user.phone_number && (
                                                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            <span className="truncate max-w-[100px] sm:max-w-none">{user.phone_number}</span>
                                                        </div>
                                                    )}
                                                    {user.address && (
                                                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                                                            <Home className="w-3 h-3 text-gray-400" />
                                                            <span className="truncate max-w-[100px] sm:max-w-[150px]">{user.address}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="space-y-1 sm:space-y-2">
                                                    {getRoleBadge(user.role)}
                                                    <div>{getStatusBadge(user.is_active)}</div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="space-y-1 sm:space-y-2">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {getVerificationBadge(user.is_email_verified)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {user.is_phone_verified ? (
                                                            <span className="badge badge-success badge-xs sm:badge-sm">Phone</span>
                                                        ) : (
                                                            <span className="badge badge-ghost badge-xs sm:badge-sm">Phone</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="space-y-1 sm:space-y-2">
                                                    <div className="flex items-center gap-1">
                                                        <Lock className="w-3 h-3" />
                                                        <span className="text-xs sm:text-sm">
                                                            {lockStatus.status} ({lockStatus.attempts})
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Shield className="w-3 h-3" />
                                                        {user.mfa_enabled ? (
                                                            <span className="badge badge-success badge-xs sm:badge-sm">MFA</span>
                                                        ) : (
                                                            <span className="badge badge-ghost badge-xs sm:badge-sm">MFA</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {user.last_login ? (
                                                    <div className="text-xs sm:text-sm text-gray-600">
                                                        {new Date(user.last_login).toLocaleDateString()}
                                                        <div className="text-xs text-gray-400">
                                                            {new Date(user.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs sm:text-sm text-gray-400">Never</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                                    <button
                                                        onClick={() => onViewUser(user.user_id)}
                                                        className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onEditUser(user.user_id)}
                                                        className="btn btn-ghost btn-xs text-green-600 hover:bg-green-50"
                                                        title="Edit User"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onRoleUser(user.user_id)}
                                                        className="btn btn-ghost btn-xs text-purple-600 hover:bg-purple-50"
                                                        title="Change Role"
                                                    >
                                                        <Crown className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onVerifyUser(user.user_id)}
                                                        className="btn btn-ghost btn-xs text-indigo-600 hover:bg-indigo-50"
                                                        title="Verify User"
                                                    >
                                                        <UserCheck className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onStatusUser(user.user_id)}
                                                        className="btn btn-ghost btn-xs text-orange-600 hover:bg-orange-50"
                                                        title="Account Status"
                                                    >
                                                        <Lock className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onMfaUser(user.user_id)}
                                                        className="btn btn-ghost btn-xs text-cyan-600 hover:bg-cyan-50"
                                                        title="MFA Settings"
                                                    >
                                                        <Shield className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onPasswordUser(user.user_id)}
                                                        className="btn btn-ghost btn-xs text-yellow-600 hover:bg-yellow-50"
                                                        title="Reset Password"
                                                    >
                                                        <Lock className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.user_id, user.username)}
                                                        className="btn btn-ghost btn-xs text-red-600 hover:bg-red-50"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="text-gray-400 w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No users found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Summary */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-3">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="text-xs sm:text-sm text-gray-600">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>
                    <div className="flex gap-3 text-xs sm:text-sm text-gray-600">
                        <span>Active: {users.filter(u => u.is_active).length}</span>
                        <span>Verified: {users.filter(u => u.is_email_verified).length}</span>
                        <span>MFA: {users.filter(u => u.mfa_enabled).length}</span>
                        <span>Admins: {users.filter(u => u.role === 'Admin').length}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserOverview