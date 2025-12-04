// src/components/admin/CustomerDetailsModal.tsx
import React from 'react'
import { X, Mail, Phone, IdCard, Shield, CreditCard, Award, Calendar, Clock, Edit, User, Car, AlertTriangle } from 'lucide-react'
import { CustomerApi } from '../../../features/Api/CustomerApi'

interface CustomerDetailsModalProps {
    customerId: number
    onClose: () => void
    onEdit: () => void
    onVerify: () => void
    onStatus: () => void
    onLoyalty: () => void
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ 
    customerId, onClose, onEdit, onVerify, onStatus, onLoyalty 
}) => {
    const { data: customer, isLoading } = CustomerApi.useGetCustomerByIdQuery(customerId)

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-8">
                    <span className="loading loading-spinner loading-lg text-purple-600"></span>
                </div>
            </div>
        )
    }

    if (!customer) {
        return null
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getLicenseStatus = (expiryDate: string) => {
        const expiry = new Date(expiryDate)
        const today = new Date()
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (expiry < today) {
            return { status: 'Expired', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', days: Math.abs(daysUntilExpiry) }
        } else if (daysUntilExpiry <= 30) {
            return { status: 'Expiring Soon', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', days: daysUntilExpiry }
        } else {
            return { status: 'Valid', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', days: daysUntilExpiry }
        }
    }

    const licenseStatus = getLicenseStatus(customer.license_expiry)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <User size={24} />
                            {customer.username}
                        </h2>
                        <p className="text-gray-600">Customer ID: #{customer.customer_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onLoyalty} className="btn btn-warning btn-sm gap-2">
                            <Award size={16} />
                            Points
                        </button>
                        <button onClick={onStatus} className="btn btn-info btn-sm gap-2">
                            <CreditCard size={16} />
                            Status
                        </button>
                        <button onClick={onVerify} className="btn btn-primary btn-sm gap-2">
                            <Shield size={16} />
                            Verify
                        </button>
                        <button onClick={onEdit} className="btn btn-success btn-sm gap-2">
                            <Edit size={16} />
                            Edit
                        </button>
                        <button onClick={onClose} className="btn btn-ghost btn-circle">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[80vh]">
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Profile Section */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="text-gray-400" size={20} />
                                            <div>
                                                <div className="text-sm text-gray-600">Username</div>
                                                <div className="font-semibold">{customer.username}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="text-gray-400" size={20} />
                                            <div>
                                                <div className="text-sm text-gray-600">Email</div>
                                                <div className="font-semibold">{customer.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="text-gray-400" size={20} />
                                            <div>
                                                <div className="text-sm text-gray-600">Phone</div>
                                                <div className="font-semibold">{customer.phone_number}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <IdCard className="text-gray-400" size={20} />
                                            <div>
                                                <div className="text-sm text-gray-600">National ID</div>
                                                <div className="font-semibold">{customer.national_id || 'Not provided'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Account Status</span>
                                            <span className={`badge ${
                                                customer.account_status === 'Active' ? 'badge-success' :
                                                customer.account_status === 'Suspended' ? 'badge-warning' : 'badge-error'
                                            }`}>
                                                {customer.account_status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Verification Status</span>
                                            <span className={`badge ${
                                                customer.verification_status === 'Verified' ? 'badge-success' :
                                                customer.verification_status === 'Pending' ? 'badge-warning' : 'badge-error'
                                            }`}>
                                                {customer.verification_status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Loyalty Points</span>
                                            <span className="font-semibold flex items-center gap-1">
                                                <Award className="text-yellow-500" size={16} />
                                                {customer.loyalty_points}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Preferred Payment</span>
                                            <span className="font-semibold">{customer.preferred_payment_method || 'Not set'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Marketing Opt-in</span>
                                            <span className={`badge ${customer.marketing_opt_in ? 'badge-success' : 'badge-ghost'}`}>
                                                {customer.marketing_opt_in ? 'Opted In' : 'Not Opted In'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* License Information */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Car size={20} />
                                        License Information
                                    </h3>
                                    <div className={`rounded-lg p-4 border-2 ${licenseStatus.bgColor} ${licenseStatus.borderColor}`}>
                                        {licenseStatus.status !== 'Valid' && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertTriangle className={licenseStatus.color} size={16} />
                                                <span className={`font-semibold ${licenseStatus.color}`}>
                                                    {licenseStatus.status} - {licenseStatus.days} days
                                                </span>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm text-gray-600">License Number</div>
                                                <div className="font-mono font-semibold">{customer.drivers_license_number}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-sm text-gray-600">Issue Date</div>
                                                    <div className="font-semibold">{formatDate(customer.license_issue_date)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Expiry Date</div>
                                                    <div className="font-semibold">{formatDate(customer.license_expiry)}</div>
                                                </div>
                                            </div>
                                            {customer.license_issuing_authority && (
                                                <div>
                                                    <div className="text-sm text-gray-600">Issuing Authority</div>
                                                    <div className="font-semibold">{customer.license_issuing_authority}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Notes */}
                                {customer.verification_notes && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification Notes</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-700">{customer.verification_notes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Timestamps */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Clock size={20} />
                                        Timestamps
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Created</span>
                                            <span className="text-sm font-semibold">{formatDate(customer.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Last Updated</span>
                                            <span className="text-sm font-semibold">{formatDate(customer.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking History - Placeholder */}
                        <div className="mt-8 border-t border-gray-200 pt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking History</h3>
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <Car className="mx-auto text-gray-400 mb-3" size={32} />
                                <div className="font-semibold text-gray-700 mb-2">Booking Management</div>
                                <div className="text-sm text-gray-500">
                                    View and manage customer bookings in the Booking Management section
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerDetailsModal