// src/components/admin/LicenseAlerts.tsx
import React, { useState } from 'react'
import { AlertTriangle, Clock, Eye, Mail, Phone, Calendar } from 'lucide-react'
import {type CustomerApi } from '../../../features/Api/CustomerApi'

const LicenseAlerts: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'expired' | 'expiring'>('expired')
    
    const { data: expiredLicenses, isLoading: expiredLoading } = CustomerApi.useGetCustomersWithExpiredLicensesQuery()
    const { data: expiringLicenses, isLoading: expiringLoading } = CustomerApi.useGetCustomersWithLicensesExpiringSoonQuery()

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getDaysUntilExpiry = (expiryDate: string) => {
        const expiry = new Date(expiryDate)
        const today = new Date()
        const diffTime = expiry.getTime() - today.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const getDaysExpired = (expiryDate: string) => {
        const expiry = new Date(expiryDate)
        const today = new Date()
        const diffTime = today.getTime() - expiry.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('expired')}
                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                                activeTab === 'expired'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <AlertTriangle size={16} />
                            Expired Licenses
                            {expiredLicenses && expiredLicenses.length > 0 && (
                                <span className="badge badge-error badge-sm">
                                    {expiredLicenses.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('expiring')}
                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                                activeTab === 'expiring'
                                    ? 'border-yellow-500 text-yellow-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Clock size={16} />
                            Expiring Soon
                            {expiringLicenses && expiringLicenses.length > 0 && (
                                <span className="badge badge-warning badge-sm">
                                    {expiringLicenses.length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>
            </div>

            {/* Expired Licenses */}
            {activeTab === 'expired' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={20} />
                            Expired Driver's Licenses
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Customers with expired licenses cannot complete new bookings
                        </p>
                    </div>
                    <div className="p-6">
                        {expiredLoading ? (
                            <div className="flex justify-center py-8">
                                <span className="loading loading-spinner loading-lg text-red-600"></span>
                            </div>
                        ) : !expiredLicenses || expiredLicenses.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Expired Licenses</h3>
                                <p className="text-gray-500">All customer licenses are currently valid</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {expiredLicenses.map((customer) => (
                                    <div key={customer.customer_id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                                <AlertTriangle className="text-red-500" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{customer.username}</h4>
                                                <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {customer.email}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Phone size={12} />
                                                        {customer.phone_number}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        Expired {getDaysExpired(customer.license_expiry)} days ago
                                                    </span>
                                                </div>
                                                <div className="text-xs text-red-600 mt-1">
                                                    License: {customer.drivers_license_number} • Expired: {formatDate(customer.license_expiry)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="btn btn-outline btn-error btn-sm">
                                                Contact Customer
                                            </button>
                                            <button className="btn btn-error btn-sm">
                                                Update License
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Expiring Soon Licenses */}
            {activeTab === 'expiring' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Clock className="text-yellow-500" size={20} />
                            Licenses Expiring Soon (within 30 days)
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Proactively contact these customers to update their license information
                        </p>
                    </div>
                    <div className="p-6">
                        {expiringLoading ? (
                            <div className="flex justify-center py-8">
                                <span className="loading loading-spinner loading-lg text-yellow-600"></span>
                            </div>
                        ) : !expiringLicenses || expiringLicenses.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Licenses Expiring Soon</h3>
                                <p className="text-gray-500">All customer licenses are valid for more than 30 days</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {expiringLicenses.map((customer) => {
                                    const daysUntilExpiry = getDaysUntilExpiry(customer.license_expiry)
                                    const severity = daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 14 ? 'medium' : 'low'
                                    
                                    return (
                                        <div key={customer.customer_id} className={`flex items-center justify-between p-4 rounded-lg border ${
                                            severity === 'high' ? 'bg-red-50 border-red-200' :
                                            severity === 'medium' ? 'bg-orange-50 border-orange-200' :
                                            'bg-yellow-50 border-yellow-200'
                                        }`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    severity === 'high' ? 'bg-red-100' :
                                                    severity === 'medium' ? 'bg-orange-100' :
                                                    'bg-yellow-100'
                                                }`}>
                                                    <Clock className={
                                                        severity === 'high' ? 'text-red-500' :
                                                        severity === 'medium' ? 'text-orange-500' :
                                                        'text-yellow-500'
                                                    } size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{customer.username}</h4>
                                                    <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Mail size={12} />
                                                            {customer.email}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={12} />
                                                            {customer.phone_number}
                                                        </span>
                                                        <span className={`font-semibold ${
                                                            severity === 'high' ? 'text-red-600' :
                                                            severity === 'medium' ? 'text-orange-600' :
                                                            'text-yellow-600'
                                                        }`}>
                                                            {daysUntilExpiry} days remaining
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        License: {customer.drivers_license_number} • Expires: {formatDate(customer.license_expiry)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="btn btn-outline btn-warning btn-sm">
                                                    Send Reminder
                                                </button>
                                                <button className="btn btn-warning btn-sm">
                                                    Update License
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default LicenseAlerts