// src/components/admin/UserManagement.tsx
import React, { useState } from 'react'
import AdminDashboardLayout from '../../../dashboardDesign/AdminDashboardLayout'
import { Users, Plus, Shield, Lock, Mail, Phone, UserCheck, AlertTriangle, Crown, Briefcase, User, Settings } from 'lucide-react'
import { UserApi } from '../../../features/Api/UsersApi.ts'
import Swal from 'sweetalert2'
import UserOverview from './UserOverview'
import CreateUserModal from './CreateUserModal'
import UserDetailsModal from './UserDetailsModal'
import EditUserModal from './EditUserModal'
import VerificationModal from './VerificationModal'
import AccountStatusModal from './AccountStatusModal'
import MFAModal from './MFAModal'
import PasswordResetModal from './PasswordResetModal'
import RoleManagementModal from './RoleManagementModal'

const UserManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'stats' | 'roles'>('overview')
    const [selectedUser, setSelectedUser] = useState<number | null>(null)
    const [viewUser, setViewUser] = useState<number | null>(null)
    const [editUser, setEditUser] = useState<number | null>(null)
    const [verifyUser, setVerifyUser] = useState<number | null>(null)
    const [statusUser, setStatusUser] = useState<number | null>(null)
    const [mfaUser, setMfaUser] = useState<number | null>(null)
    const [passwordUser, setPasswordUser] = useState<number | null>(null)
    const [roleUser, setRoleUser] = useState<number | null>(null)
    
    // RTK Query hooks
    const { data: users, isLoading, error, refetch } = UserApi.useGetAllUsersQuery()
    const { data: statistics } = UserApi.useGetUserStatisticsQuery()

    // Calculate statistics
    const userStats = statistics || {
        total: users?.length || 0,
        active: users?.filter(u => u.is_active)?.length || 0,
        inactive: users?.filter(u => !u.is_active)?.length || 0,
        verified: users?.filter(u => u.is_email_verified)?.length || 0,
        pending: users?.filter(u => !u.is_email_verified)?.length || 0,
        locked: users?.filter(u => u.lockout_end !== null)?.length || 0,
        byRole: {}
    }

    // Role distribution for stats
    const roleDistribution = statistics?.byRole || {
        Customer: users?.filter(u => u.role === 'Customer')?.length || 0,
        Agent: users?.filter(u => u.role === 'Agent')?.length || 0,
        Manager: users?.filter(u => u.role === 'Manager')?.length || 0,
        Admin: users?.filter(u => u.role === 'Admin')?.length || 0
    }

    return (
        <AdminDashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User Management</h1>
                        <p className="text-gray-600 text-sm sm:text-base">Manage system users and permissions</p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* <button
                        onClick={() => refetch()}
                        className="btn btn-outline btn-sm sm:btn-md gap-2 order-2 sm:order-1"
                    >
                        <Settings size={16} />
                        Refresh
                    </button> */}
                    <button
                        onClick={() => setActiveTab('create')}
                        className="btn btn-primary btn-sm sm:btn-md gap-2 bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
                    >
                        <Plus size={16} />
                        <span className="hidden xs:inline">Add New User</span>
                        <span className="xs:hidden">Add User</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards - Responsive Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {/* Total Users Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-800">{userStats.total}</p>
                        </div>
                        <Users className="text-blue-500 hidden xs:block" size={20} />
                        <Users className="text-blue-500 xs:hidden" size={16} />
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex flex-col xs:flex-row justify-between gap-1">
                            <span className="text-xs text-gray-500">Active: {userStats.active}</span>
                            <span className="text-xs text-gray-500">Inactive: {userStats.inactive}</span>
                        </div>
                    </div>
                </div>
                
                {/* Email Verification Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Verified</p>
                            <p className="text-xl sm:text-2xl font-bold text-green-600">{userStats.verified}</p>
                        </div>
                        <Mail className="text-green-500 hidden xs:block" size={20} />
                        <Mail className="text-green-500 xs:hidden" size={16} />
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex flex-col xs:flex-row justify-between gap-1">
                            <span className="text-xs text-gray-500">Pending: {userStats.pending}</span>
                            <span className="text-xs text-gray-500">Phone: {users?.filter(u => u.is_phone_verified)?.length || 0}</span>
                        </div>
                    </div>
                </div>
                
                {/* Security Status Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Security</p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{userStats.locked}</p>
                                <span className="text-xs text-gray-500">locked</span>
                            </div>
                        </div>
                        <Lock className="text-yellow-500 hidden xs:block" size={20} />
                        <Lock className="text-yellow-500 xs:hidden" size={16} />
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex flex-col xs:flex-row justify-between gap-1">
                            <span className="text-xs text-gray-500">MFA: {users?.filter(u => u.mfa_enabled)?.length || 0}</span>
                            <span className="text-xs text-gray-500">High Risk: {users?.filter(u => u.failed_login_attempts > 3)?.length || 0}</span>
                        </div>
                    </div>
                </div>
                
                {/* Role Distribution Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Roles</p>
                            <div className="flex items-center gap-2">
                                <p className="text-xl sm:text-2xl font-bold text-purple-600">{roleDistribution.Admin || 0}</p>
                                <span className="text-xs text-gray-500">admins</span>
                            </div>
                        </div>
                        <Crown className="text-purple-500 hidden xs:block" size={20} />
                        <Crown className="text-purple-500 xs:hidden" size={16} />
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-1">
                            <span className="text-xs text-gray-500 truncate">Customer: {roleDistribution.Customer || 0}</span>
                            <span className="text-xs text-gray-500 truncate">Agent: {roleDistribution.Agent || 0}</span>
                            <span className="text-xs text-gray-500 truncate">Manager: {roleDistribution.Manager || 0}</span>
                            <span className="text-xs text-gray-500 truncate">Admin: {roleDistribution.Admin || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs - Responsive */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-x-auto">
                <div className="border-b border-gray-200 min-w-max">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users size={14} className="sm:hidden" />
                                User Overview
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 'roles'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Crown size={14} className="sm:hidden" />
                                Role Management
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 'stats'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Shield size={14} className="sm:hidden" />
                                Statistics
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 'create'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Plus size={14} className="sm:hidden" />
                                Add User
                            </div>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <UserOverview
                    users={users || []}
                    isLoading={isLoading}
                    error={error}
                    onViewUser={setViewUser}
                    onEditUser={setEditUser}
                    onVerifyUser={setVerifyUser}
                    onStatusUser={setStatusUser}
                    onMfaUser={setMfaUser}
                    onPasswordUser={setPasswordUser}
                    onRoleUser={setRoleUser}
                />
            )}

            {activeTab === 'create' && (
                <CreateUserModal
                    onClose={() => setActiveTab('overview')}
                    onSuccess={() => {
                        setActiveTab('overview')
                        Swal.fire({
                            title: 'Success!',
                            text: 'User created successfully.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        })
                        refetch()
                    }}
                />
            )}

            {activeTab === 'stats' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">User Statistics</h3>
                    
                    {/* Role Distribution Chart */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">Role Distribution</h4>
                        <div className="space-y-3">
                            {Object.entries(roleDistribution).map(([role, count]) => (
                                <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            role === 'Admin' ? 'bg-red-100 text-red-600' :
                                            role === 'Manager' ? 'bg-yellow-100 text-yellow-600' :
                                            role === 'Agent' ? 'bg-blue-100 text-blue-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                            {role === 'Admin' ? <Crown size={16} /> :
                                             role === 'Manager' ? <Briefcase size={16} /> :
                                             role === 'Agent' ? <UserCheck size={16} /> :
                                             <User size={16} />}
                                        </div>
                                        <span className="font-medium text-gray-700">{role}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-gray-800">{count}</span>
                                        <span className="text-xs text-gray-500">
                                            ({Math.round((count / userStats.total) * 100) || 0}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Verification Status */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">Verification Status</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Email Verified</p>
                                        <p className="text-2xl font-bold text-green-600">{userStats.verified}</p>
                                    </div>
                                    <Mail className="text-green-500" size={20} />
                                </div>
                                <p className="text-xs text-green-600 mt-2">
                                    {Math.round((userStats.verified / userStats.total) * 100) || 0}% of users
                                </p>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">Pending Verification</p>
                                        <p className="text-2xl font-bold text-yellow-600">{userStats.pending}</p>
                                    </div>
                                    <AlertTriangle className="text-yellow-500" size={20} />
                                </div>
                                <p className="text-xs text-yellow-600 mt-2">
                                    {Math.round((userStats.pending / userStats.total) * 100) || 0}% of users
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Security Metrics */}
                    <div>
                        <h4 className="font-medium text-gray-700 mb-3">Security Metrics</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-blue-800">MFA Enabled</p>
                                <p className="text-xl font-bold text-blue-600">
                                    {users?.filter(u => u.mfa_enabled)?.length || 0}
                                </p>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-red-800">Locked Accounts</p>
                                <p className="text-xl font-bold text-red-600">{userStats.locked}</p>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-purple-800">Failed Logins</p>
                                <p className="text-xl font-bold text-purple-600">
                                    {users?.reduce((sum, user) => sum + user.failed_login_attempts, 0) || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'roles' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Role Management</h3>
                    <p className="text-gray-600 mb-6">Manage user roles and permissions across the system</p>
                    
                    {/* Role Information Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <User className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-800">Customer</h4>
                                    <p className="text-2xl font-bold text-green-600">{roleDistribution.Customer || 0}</p>
                                </div>
                            </div>
                            <p className="text-sm text-green-700">Basic user permissions</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <UserCheck className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-800">Agent</h4>
                                    <p className="text-2xl font-bold text-blue-600">{roleDistribution.Agent || 0}</p>
                                </div>
                            </div>
                            <p className="text-sm text-blue-700">Booking and customer management</p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Briefcase className="text-yellow-600" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-yellow-800">Manager</h4>
                                    <p className="text-2xl font-bold text-yellow-600">{roleDistribution.Manager || 0}</p>
                                </div>
                            </div>
                            <p className="text-sm text-yellow-700">Team and report management</p>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Crown className="text-red-600" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-red-800">Admin</h4>
                                    <p className="text-2xl font-bold text-red-600">{roleDistribution.Admin || 0}</p>
                                </div>
                            </div>
                            <p className="text-sm text-red-700">Full system administration</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-3">Quick Actions</h4>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className="btn btn-outline btn-sm gap-2"
                            >
                                <Users size={14} />
                                View All Users
                            </button>
                            <button
                                onClick={() => setActiveTab('create')}
                                className="btn btn-primary btn-sm gap-2"
                            >
                                <Plus size={14} />
                                Create New User
                            </button>
                            {/* <button
                                onClick={() => refetch()}
                                className="btn btn-ghost btn-sm gap-2"
                            >
                                <Settings size={14} />
                                Refresh Data
                            </button> */}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {viewUser && (
                <UserDetailsModal
                    userId={viewUser}
                    onClose={() => setViewUser(null)}
                    onEdit={() => {
                        setEditUser(viewUser)
                        setViewUser(null)
                    }}
                    onVerify={() => {
                        setVerifyUser(viewUser)
                        setViewUser(null)
                    }}
                    onStatus={() => {
                        setStatusUser(viewUser)
                        setViewUser(null)
                    }}
                    onMfa={() => {
                        setMfaUser(viewUser)
                        setViewUser(null)
                    }}
                    onPassword={() => {
                        setPasswordUser(viewUser)
                        setViewUser(null)
                    }}
                    onRole={() => {
                        setRoleUser(viewUser)
                        setViewUser(null)
                    }}
                />
            )}

            {editUser && (
                <EditUserModal
                    userId={editUser}
                    onClose={() => setEditUser(null)}
                    onSuccess={() => {
                        setEditUser(null)
                        Swal.fire({
                            title: 'Success!',
                            text: 'User updated successfully.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        })
                        refetch()
                    }}
                />
            )}

            {verifyUser && (
                <VerificationModal
                    userId={verifyUser}
                    onClose={() => setVerifyUser(null)}
                    onSuccess={() => {
                        setVerifyUser(null)
                        Swal.fire({
                            title: 'Success!',
                            text: 'Verification status updated.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        })
                        refetch()
                    }}
                />
            )}

            {statusUser && (
                <AccountStatusModal
                    userId={statusUser}
                    onClose={() => setStatusUser(null)}
                    onSuccess={() => {
                        setStatusUser(null)
                        Swal.fire({
                            title: 'Success!',
                            text: 'Account status updated.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        })
                        refetch()
                    }}
                />
            )}

            {mfaUser && (
                <MFAModal
                    userId={mfaUser}
                    onClose={() => setMfaUser(null)}
                    onSuccess={() => {
                        setMfaUser(null)
                        Swal.fire({
                            title: 'Success!',
                            text: 'MFA settings updated.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        })
                        refetch()
                    }}
                />
            )}

            {passwordUser && (
                <PasswordResetModal
                    userId={passwordUser}
                    onClose={() => setPasswordUser(null)}
                    onSuccess={() => {
                        setPasswordUser(null)
                        Swal.fire({
                            title: 'Success!',
                            text: 'Password reset successful.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        })
                        refetch()
                    }}
                />
            )}

            {roleUser && (
                <RoleManagementModal
                    userId={roleUser}
                    onClose={() => setRoleUser(null)}
                    onSuccess={() => {
                        setRoleUser(null)
                        Swal.fire({
                            title: 'Success!',
                            text: 'User role updated successfully.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        })
                        refetch()
                    }}
                />
            )}
        </AdminDashboardLayout>
    )
}

export default UserManagement