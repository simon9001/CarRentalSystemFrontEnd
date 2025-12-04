// src/components/admin/VerificationModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { CustomerApi } from '../../../features/Api/CustomerApi'
import Swal from 'sweetalert2'
import {type UpdateVerificationRequest } from '../../../types/CustomerTypes'

interface VerificationModalProps {
    customerId: number
    onClose: () => void
    onSuccess: () => void
}

const VerificationModal: React.FC<VerificationModalProps> = ({ customerId, onClose, onSuccess }) => {
    const { data: customer } = CustomerApi.useGetCustomerByIdQuery(customerId)
    const [updateVerification] = CustomerApi.useUpdateVerificationMutation()
    
    const [verificationData, setVerificationData] = useState<UpdateVerificationRequest>({
        verification_status: 'Pending',
        verification_notes: ''
    })

    useEffect(() => {
        if (customer) {
            setVerificationData({
                verification_status: customer.verification_status,
                verification_notes: customer.verification_notes || ''
            })
        }
    }, [customer])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!customer) return

        // Show warning when rejecting a customer
        if (verificationData.verification_status === 'Rejected' && customer.verification_status !== 'Rejected') {
            const result = await Swal.fire({
                title: 'Reject Customer?',
                text: 'This will mark the customer as rejected. They will not be able to complete bookings.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, reject customer',
                cancelButtonText: 'Cancel'
            })

            if (!result.isConfirmed) {
                return
            }
        }

        try {
            await updateVerification({ 
                customer_id: customerId, 
                verification: verificationData 
            }).unwrap()
            onSuccess()
        } catch (error) {
            Swal.fire('Error!', 'Failed to update verification status.', 'error')
        }
    }

    if (!customer) return null

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Verified':
                return <CheckCircle className="text-green-500" size={20} />
            case 'Rejected':
                return <XCircle className="text-red-500" size={20} />
            default:
                return <AlertCircle className="text-yellow-500" size={20} />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Verified':
                return 'text-green-700 bg-green-50 border-green-200'
            case 'Rejected':
                return 'text-red-700 bg-red-50 border-red-200'
            default:
                return 'text-yellow-700 bg-yellow-50 border-yellow-200'
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Shield className="text-purple-600" size={24} />
                        Customer Verification
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
                                <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(customer.verification_status)}`}>
                                    {getStatusIcon(customer.verification_status)}
                                    Current: {customer.verification_status}
                                </div>
                            </div>
                        </div>

                        {/* Verification Status */}
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">Verification Status *</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Pending', 'Verified', 'Rejected'].map((status) => (
                                    <label key={status} className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="verification_status"
                                            value={status}
                                            checked={verificationData.verification_status === status}
                                            onChange={(e) => setVerificationData(prev => ({
                                                ...prev,
                                                verification_status: e.target.value
                                            }))}
                                            className="hidden"
                                        />
                                        <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                                            verificationData.verification_status === status
                                                ? status === 'Verified' 
                                                    ? 'border-green-500 bg-green-50 text-green-700' 
                                                    : status === 'Rejected'
                                                    ? 'border-red-500 bg-red-50 text-red-700'
                                                    : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}>
                                            <div className="flex items-center justify-center gap-1">
                                                {getStatusIcon(status)}
                                                <span className="font-medium">{status}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Verification Notes */}
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">Verification Notes</span>
                            </label>
                            <textarea
                                name="verification_notes"
                                value={verificationData.verification_notes}
                                onChange={(e) => setVerificationData(prev => ({
                                    ...prev,
                                    verification_notes: e.target.value
                                }))}
                                className="textarea textarea-bordered h-24"
                                placeholder="Add notes about the verification process..."
                            />
                        </div>

                        {/* Warning for Rejected status */}
                        {verificationData.verification_status === 'Rejected' && customer.verification_status !== 'Rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertCircle size={16} />
                                    <span className="font-medium">Warning</span>
                                </div>
                                <p className="text-sm text-red-600 mt-1">
                                    Rejecting this customer will prevent them from making new bookings.
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
                            className="btn btn-primary"
                            disabled={verificationData.verification_status === customer.verification_status && verificationData.verification_notes === (customer.verification_notes || '')}
                        >
                            Update Verification
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default VerificationModal