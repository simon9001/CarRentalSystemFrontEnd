// src/components/admin/VerificationModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Mail, Phone, Shield, CheckCircle, XCircle } from 'lucide-react'
import { UserApi } from  '../../../features/Api/UsersApi.ts'
import Swal from 'sweetalert2'
import {type  UpdateVerificationRequest } from '../../../types/UserTypes'

interface VerificationModalProps {
    userId: number
    onClose: () => void
    onSuccess: () => void
}

const VerificationModal: React.FC<VerificationModalProps> = ({ userId, onClose, onSuccess }) => {
    const { data: user } = UserApi.useGetUserByIdQuery(userId)
    const [updateVerification] = UserApi.useUpdateUserVerificationMutation()
    
    const [formData, setFormData] = useState<UpdateVerificationRequest>({
        is_email_verified: false,
        is_phone_verified: false
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({
                is_email_verified: user.is_email_verified,
                is_phone_verified: user.is_phone_verified
            })
        }
    }, [user])

    const handleToggle = (field: keyof UpdateVerificationRequest) => {
        setFormData(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate at least one field is changing
        if (!user) return

        if (formData.is_email_verified === user.is_email_verified && 
            formData.is_phone_verified === user.is_phone_verified) {
            Swal.fire('Info!', 'No changes detected.', 'info')
            return
        }

        setLoading(true)
        try {
            await updateVerification({
                userId,
                data: formData
            }).unwrap()
            onSuccess()
        } catch (error: any) {
            Swal.fire('Error!', error.data?.error || 'Failed to update verification', 'error')
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
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Shield className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Verification Status</h2>
                                <p className="text-gray-600">Update verification for {user.username}</p>
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Email Verification */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Mail className="text-gray-600" size={20} />
                                <div>
                                    <h3 className="font-medium text-gray-800">Email Verification</h3>
                                    <p className="text-sm text-gray-600">Verify user's email address</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {formData.is_email_verified ? (
                                    <CheckCircle className="text-green-500" size={20} />
                                ) : (
                                    <XCircle className="text-gray-400" size={20} />
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleToggle('is_email_verified')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                        formData.is_email_verified ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        formData.is_email_verified ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </div>

                        {/* Phone Verification */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Phone className="text-gray-600" size={20} />
                                <div>
                                    <h3 className="font-medium text-gray-800">Phone Verification</h3>
                                    <p className="text-sm text-gray-600">Verify user's phone number</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {formData.is_phone_verified ? (
                                    <CheckCircle className="text-green-500" size={20} />
                                ) : (
                                    <XCircle className="text-gray-400" size={20} />
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleToggle('is_phone_verified')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                        formData.is_phone_verified ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        formData.is_phone_verified ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </div>

                        {/* Current Status */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-medium text-blue-800 mb-2">Current Status</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-700">Email:</span>
                                    <span className={`font-medium ${
                                        user.is_email_verified ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {user.is_email_verified ? 'Verified' : 'Not Verified'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-700">Phone:</span>
                                    <span className={`font-medium ${
                                        user.is_phone_verified ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {user.is_phone_verified ? 'Verified' : 'Not Verified'}
                                    </span>
                                </div>
                            </div>
                        </div>
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
                                'Update Verification'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default VerificationModal