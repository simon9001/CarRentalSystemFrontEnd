// src/components/admin/CustomerOverview.tsx - FIXED VERSION
import React, { useState, useMemo } from 'react'
import { Search, Eye, Edit, Shield, CreditCard, Award, Trash2, Mail, Phone, IdCard, Users, Crown } from 'lucide-react'
import { type CustomerDetailsResponse } from '../../../types/CustomerTypes'
import Swal from 'sweetalert2'
import { CustomerApi } from '../../../features/Api/CustomerApi'

interface CustomerOverviewProps {
    customers: CustomerDetailsResponse[]
    isLoading: boolean
    error: any
    onViewCustomer: (id: number) => void
    onEditCustomer: (id: number) => void
    onVerifyCustomer: (id: number) => void
    onStatusCustomer: (id: number) => void
    onLoyaltyCustomer: (id: number) => void
    onRoleCustomer: (id: number) => void
}

const CustomerOverview: React.FC<CustomerOverviewProps> = ({
    customers,
    isLoading,
    error,
    onViewCustomer,
    onEditCustomer,
    onVerifyCustomer,
    onStatusCustomer,
    onLoyaltyCustomer,
    onRoleCustomer
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [accountFilter, setAccountFilter] = useState('all')
    const [verificationFilter, setVerificationFilter] = useState('all')
    const [marketingFilter, setMarketingFilter] = useState('all')
    const [licenseFilter, setLicenseFilter] = useState('all')
    const [mobileView, setMobileView] = useState<'table' | 'cards'>('table')

    // FIXED: Using the correct hook name
    const [deleteCustomerDetails] = CustomerApi.useDeleteCustomerDetailsMutation()

    // Filter customers
    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const matchesSearch = 
                customer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone_number?.includes(searchTerm) ||
                customer.drivers_license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.national_id?.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesAccount = accountFilter === 'all' || customer.account_status === accountFilter
            const matchesVerification = verificationFilter === 'all' || customer.verification_status === verificationFilter
            const matchesMarketing = marketingFilter === 'all' || 
                (marketingFilter === 'yes' && customer.marketing_opt_in) ||
                (marketingFilter === 'no' && !customer.marketing_opt_in)
            
            const matchesLicense = licenseFilter === 'all' || 
                (licenseFilter === 'expired' && new Date(customer.license_expiry) < new Date()) ||
                (licenseFilter === 'expiring' && 
                 new Date(customer.license_expiry) >= new Date() && 
                 new Date(customer.license_expiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) ||
                (licenseFilter === 'valid' && new Date(customer.license_expiry) > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

            return matchesSearch && matchesAccount && matchesVerification && matchesMarketing && matchesLicense
        })
    }, [customers, searchTerm, accountFilter, verificationFilter, marketingFilter, licenseFilter])

    // Get status badge
    const getAccountStatusBadge = (status: string) => {
        const statusConfig = {
            'Active': 'badge-success',
            'Suspended': 'badge-warning',
            'Inactive': 'badge-error',
            'Pending_Verification': 'badge-info'
        }
        return <span className={`badge ${statusConfig[status as keyof typeof statusConfig] || 'badge-ghost'} badge-xs sm:badge-sm`}>{status}</span>
    }

    const getVerificationBadge = (status: string) => {
        const statusConfig = {
            'Verified': 'badge-success',
            'Pending': 'badge-warning',
            'Rejected': 'badge-error'
        }
        return <span className={`badge ${statusConfig[status as keyof typeof statusConfig] || 'badge-ghost'} badge-xs sm:badge-sm`}>{status}</span>
    }

    // Get license status and styling
    const getLicenseStatus = (expiryDate: string) => {
        const expiry = new Date(expiryDate)
        const today = new Date()
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (expiry < today) {
            return { status: 'Expired', class: 'bg-red-50 border-red-200', days: Math.abs(daysUntilExpiry) }
        } else if (daysUntilExpiry <= 30) {
            return { status: 'Expiring', class: 'bg-yellow-50 border-yellow-200', days: daysUntilExpiry }
        } else {
            return { status: 'Valid', class: '', days: daysUntilExpiry }
        }
    }

    // Handle delete - IMPORTANT: This only deletes customer details, not the user
    const handleDeleteCustomer = async (customerId: number, customerName: string) => {
        const result = await Swal.fire({
            title: 'Delete Customer Details?',
            text: `This will permanently delete customer details for "${customerName}" but the user account will remain.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Delete Details',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        })

        if (result.isConfirmed) {
            try {
                await deleteCustomerDetails(customerId).unwrap()
                Swal.fire('Deleted!', 'Customer details have been deleted.', 'success')
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete customer details.', 'error')
            }
        }
    }

    // Mobile card view for customer
    const CustomerCard = ({ customer }: { customer: CustomerDetailsResponse }) => {
        const licenseStatus = getLicenseStatus(customer.license_expiry)
        
        return (
            <div className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow ${licenseStatus.class}`}>
                {/* Customer Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800 truncate">{customer.username}</h3>
                            {getVerificationBadge(customer.verification_status)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <IdCard className="w-3 h-3" />
                            {customer.national_id || 'No National ID'}
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onViewCustomer(customer.customer_id)}
                            className="btn btn-ghost btn-xs text-blue-600"
                            title="View Details"
                        >
                            <Eye className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => onRoleCustomer(customer.customer_id)}
                            className="btn btn-ghost btn-xs text-purple-600"
                            title="Change Role"
                        >
                            <Crown className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => handleDeleteCustomer(customer.customer_id, customer.username || 'Customer')}
                            className="btn btn-ghost btn-xs text-red-600"
                            title="Delete Customer Details"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{customer.email}</span>
                    </div>
                    {customer.phone_number && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {customer.phone_number}
                        </div>
                    )}
                </div>

                {/* Status & Security */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="space-y-1">
                        <div className="font-medium text-gray-700">Account Status</div>
                        <div>{getAccountStatusBadge(customer.account_status)}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium text-gray-700">License</div>
                        <div className="flex items-center gap-1">
                            <span className={`${
                                licenseStatus.status === 'Expired' ? 'text-red-600' :
                                licenseStatus.status === 'Expiring' ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                                {licenseStatus.status}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium text-gray-700">Loyalty Points</div>
                        <div className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-yellow-500" />
                            <span className="font-semibold">{customer.loyalty_points}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium text-gray-700">Marketing</div>
                        <div>
                            {customer.marketing_opt_in ? (
                                <span className="badge badge-success badge-xs">Opted In</span>
                            ) : (
                                <span className="badge badge-ghost badge-xs">Not Opted In</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                    <button
                        onClick={() => onEditCustomer(customer.customer_id)}
                        className="btn btn-ghost btn-xs text-green-600"
                        title="Edit"
                    >
                        <Edit className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onVerifyCustomer(customer.customer_id)}
                        className="btn btn-ghost btn-xs text-purple-600"
                        title="Verify"
                    >
                        <Shield className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onStatusCustomer(customer.customer_id)}
                        className="btn btn-ghost btn-xs text-orange-600"
                        title="Status"
                    >
                        <CreditCard className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onLoyaltyCustomer(customer.customer_id)}
                        className="btn btn-ghost btn-xs text-yellow-600"
                        title="Loyalty"
                    >
                        <Award className="w-3 h-3" />
                    </button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <span className="loading loading-spinner loading-lg text-purple-600"></span>
                <span className="ml-3 text-gray-600">Loading customers...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">Error Loading Customers</h3>
                <p className="text-red-600 text-sm">Unable to fetch customers. Please try again later.</p>
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
                                placeholder="Search customers..."
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
                            value={accountFilter}
                            onChange={(e) => setAccountFilter(e.target.value)}
                        >
                            <option value="all">All Account Status</option>
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Pending_Verification">Pending Verification</option>
                        </select>

                        <select 
                            className="select select-bordered select-xs sm:select-sm text-xs sm:text-sm"
                            value={verificationFilter}
                            onChange={(e) => setVerificationFilter(e.target.value)}
                        >
                            <option value="all">All Verification</option>
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Rejected">Rejected</option>
                        </select>

                        <select 
                            className="select select-bordered select-xs sm:select-sm text-xs sm:text-sm"
                            value={marketingFilter}
                            onChange={(e) => setMarketingFilter(e.target.value)}
                        >
                            <option value="all">All Marketing</option>
                            <option value="yes">Opted In</option>
                            <option value="no">Not Opted In</option>
                        </select>

                        <select 
                            className="select select-bordered select-xs sm:select-sm text-xs sm:text-sm"
                            value={licenseFilter}
                            onChange={(e) => setLicenseFilter(e.target.value)}
                        >
                            <option value="all">All Licenses</option>
                            <option value="expired">Expired</option>
                            <option value="expiring">Expiring Soon</option>
                            <option value="valid">Valid</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            {mobileView === 'cards' && (
                <div className="p-3 sm:p-4">
                    {filteredCustomers.map((customer) => (
                        <CustomerCard key={customer.customer_id} customer={customer} />
                    ))}
                    
                    {filteredCustomers.length === 0 && (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-400 w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-600 mb-2">No customers found</h3>
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
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">Customer</th>
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">Contact</th>
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">License</th>
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">Account Status</th>
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">Verification</th>
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">Loyalty Points</th>
                                    <th className="text-left font-semibold text-gray-700 p-3 text-xs sm:text-sm">Marketing</th>
                                    <th className="text-center font-semibold text-gray-700 p-3 text-xs sm:text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => {
                                    const licenseStatus = getLicenseStatus(customer.license_expiry)
                                    
                                    return (
                                        <tr key={customer.customer_id} className={`hover:bg-gray-50 ${licenseStatus.class}`}>
                                            <td className="p-3">
                                                <div>
                                                    <div className="font-bold text-gray-800 text-sm sm:text-base">{customer.username}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <IdCard className="w-3 h-3" />
                                                        {customer.national_id || 'No National ID'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-xs sm:text-sm">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        <span className="truncate max-w-[120px] sm:max-w-[150px]">{customer.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                        {customer.phone_number}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    <div className="font-mono text-xs sm:text-sm">{customer.drivers_license_number}</div>
                                                    <div className={`text-xs ${
                                                        licenseStatus.status === 'Expired' ? 'text-red-600' :
                                                        licenseStatus.status === 'Expiring' ? 'text-yellow-600' : 'text-gray-500'
                                                    }`}>
                                                        {licenseStatus.status} 
                                                        {licenseStatus.status !== 'Valid' && ` (${licenseStatus.days} days)`}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">{getAccountStatusBadge(customer.account_status)}</td>
                                            <td className="p-3">{getVerificationBadge(customer.verification_status)}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-1">
                                                    <Award className="w-3 h-3 text-yellow-500" />
                                                    <span className="font-semibold text-sm sm:text-base">{customer.loyalty_points}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {customer.marketing_opt_in ? (
                                                    <span className="badge badge-success badge-xs sm:badge-sm">Opted In</span>
                                                ) : (
                                                    <span className="badge badge-ghost badge-xs sm:badge-sm">Not Opted In</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                                    <button
                                                        onClick={() => onViewCustomer(customer.customer_id)}
                                                        className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onEditCustomer(customer.customer_id)}
                                                        className="btn btn-ghost btn-xs text-green-600 hover:bg-green-50"
                                                        title="Edit Customer"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onRoleCustomer(customer.customer_id)}
                                                        className="btn btn-ghost btn-xs text-purple-600 hover:bg-purple-50"
                                                        title="Change Role"
                                                    >
                                                        <Crown className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onVerifyCustomer(customer.customer_id)}
                                                        className="btn btn-ghost btn-xs text-indigo-600 hover:bg-indigo-50"
                                                        title="Verify Customer"
                                                    >
                                                        <Shield className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onStatusCustomer(customer.customer_id)}
                                                        className="btn btn-ghost btn-xs text-orange-600 hover:bg-orange-50"
                                                        title="Account Status"
                                                    >
                                                        <CreditCard className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onLoyaltyCustomer(customer.customer_id)}
                                                        className="btn btn-ghost btn-xs text-yellow-600 hover:bg-yellow-50"
                                                        title="Loyalty Points"
                                                    >
                                                        <Award className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCustomer(customer.customer_id, customer.username || 'Customer')}
                                                        className="btn btn-ghost btn-xs text-red-600 hover:bg-red-50"
                                                        title="Delete Customer Details"
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

                        {filteredCustomers.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="text-gray-400 w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No customers found</h3>
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
                        Showing {filteredCustomers.length} of {customers.length} customers
                    </div>
                    <div className="flex gap-3 text-xs sm:text-sm text-gray-600">
                        <span>Active: {customers.filter(c => c.account_status === 'Active').length}</span>
                        <span>Verified: {customers.filter(c => c.verification_status === 'Verified').length}</span>
                        <span>Expired Licenses: {customers.filter(c => new Date(c.license_expiry) < new Date()).length}</span>
                        <span>Marketing Opt-In: {customers.filter(c => c.marketing_opt_in).length}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerOverview