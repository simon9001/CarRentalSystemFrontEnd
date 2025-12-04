// src/components/admin/AccountStatusModal.tsx
import React, { useState, useEffect } from 'react'
import { X, CreditCard, AlertTriangle, CheckCircle, PauseCircle } from 'lucide-react'
import { CustomerApi } from '../../../features/Api/CustomerApi'
import Swal from 'sweetalert2'
// import { UpdateAccountStatusRequest } from '../../types/HeroTypes'

interface AccountStatusModalProps {
    customerId: number
    onClose: () => void
    onSuccess: () => void
}

const AccountStatusModal: React.FC<AccountStatusModalProps> = ({ customerId, onClose, onSuccess }) => {
    const { data: customer } = CustomerApi.useGetCustomerByIdQuery(customerId)
    const [updateAccountStatus] = CustomerApi.useUpdateAccountStatusMutation()
    
    const [accountStatus, setAccountStatus] = useState<string>('Active')

    useEffect(() => {
        if (customer) {
            setAccountStatus(customer.account_status)
        }
    }, [customer])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!customer) return

        // Show confirmation for status changes
        if (accountStatus !== customer.account_status) {
            let confirmationMessage = ''
            
            if (accountStatus === 'Suspended') {
                confirmationMessage = 'Suspending this account will prevent the customer from making new bookings. Existing bookings will be unaffected.'
            } else if (accountStatus === 'Closed') {
                confirmationMessage = 'Closing this account is permanent and cannot be undone. The customer will lose access to their account.'
            } else if (accountStatus === 'Active' && customer.account_status === 'Suspended') {
                confirmationMessage = 'Reactivating this account will allow the customer to make new bookings again.'
            }

            if (confirmationMessage) {
                const result = await Swal.fire({
                    title: `Change to ${accountStatus}?`,
                    text: confirmationMessage,
                    icon: accountStatus === 'Closed' ? 'error' : 'warning',
                    showCancelButton: true,
                    confirmButtonColor: accountStatus === 'Closed' ? '#d33' : '#3085d6',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: `Yes, ${accountStatus.toLowerCase()} account`,
                    cancelButtonText: 'Cancel'
                })

                if (!result.isConfirmed) {
                    return
                }
            }
        }

        try {
            await updateAccountStatus({ 
                customer_id: customerId, 
                account_status: { account_status: accountStatus } 
            }).unwrap()
            onSuccess()
        } catch (error) {
            Swal.fire('Error!', 'Failed to update account status.', 'error')
        }
    }

    if (!customer) return null

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active':
                return <CheckCircle className="text-green-500" size={20} />
            case 'Suspended':
                return <PauseCircle className="text-yellow-500" size={20} />
            case 'Closed':
                return <AlertTriangle className="text-red-500" size={20} />
            default:
                return <CreditCard className="text-gray-500" size={20} />
        }
    }

    const getStatusDescription = (status: string) => {
        switch (status) {
            case 'Active':
                return 'Customer can make bookings and access their account normally.'
            case 'Suspended':
                return 'Customer cannot make new bookings. Existing bookings remain active.'
            case 'Closed':
                return 'Account is permanently closed. Customer loses all access.'
            default:
                return ''
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <CreditCard className="text-blue-600" size={24} />
                        Account Status
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        {/* Customer Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="text-center">
                                <h3 className="font-semibold text-gray-800">{customer.username}</h3>
                                <p className="text-sm text-gray-600">{customer.email}</p>
                                <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                    customer.account_status === 'Active' ? 'bg-green-100 text-green-800' :
                                    customer.account_status === 'Suspended' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {getStatusIcon(customer.account_status)}
                                    Current: {customer.account_status}
                                </div>
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">New Account Status *</span>
                            </label>
                            <div className="space-y-2">
                                {['Active', 'Suspended', 'Closed'].map((status) => (
                                    <label key={status} className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-blue-300">
                                        <input
                                            type="radio"
                                            name="account_status"
                                            value={status}
                                            checked={accountStatus === status}
                                            onChange={(e) => setAccountStatus(e.target.value)}
                                            className="radio radio-primary"
                                        />
                                        <div className="flex items-center gap-2 flex-1">
                                            {getStatusIcon(status)}
                                            <div>
                                                <div className="font-medium">{status}</div>
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
                        {accountStatus !== customer.account_status && (
                            <div className={`rounded-lg p-4 mb-6 ${
                                accountStatus === 'Closed' ? 'bg-red-50 border border-red-200' :
                                accountStatus === 'Suspended' ? 'bg-yellow-50 border border-yellow-200' :
                                'bg-green-50 border border-green-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={16} className={
                                        accountStatus === 'Closed' ? 'text-red-600' :
                                        accountStatus === 'Suspended' ? 'text-yellow-600' :
                                        'text-green-600'
                                    } />
                                    <span className={`font-medium ${
                                        accountStatus === 'Closed' ? 'text-red-700' :
                                        accountStatus === 'Suspended' ? 'text-yellow-700' :
                                        'text-green-700'
                                    }`}>
                                        Changing from {customer.account_status} to {accountStatus}
                                    </span>
                                </div>
                                <p className={`text-sm mt-1 ${
                                    accountStatus === 'Closed' ? 'text-red-600' :
                                    accountStatus === 'Suspended' ? 'text-yellow-600' :
                                    'text-green-600'
                                }`}>
                                    {getStatusDescription(accountStatus)}
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
                                accountStatus === 'Closed' ? 'btn-error' :
                                accountStatus === 'Suspended' ? 'btn-warning' : 'btn-success'
                            }`}
                            disabled={accountStatus === customer.account_status}
                        >
                            Update Status
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AccountStatusModal