// src/components/admin/MFAModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Shield, Key, QrCode, Copy, Check } from 'lucide-react'
import { UserApi } from  '../../../features/Api/UsersApi.ts'
import Swal from 'sweetalert2'
import {type UpdateMFARequest } from '../../../types/UserTypes'

interface MFAModalProps {
    userId: number
    onClose: () => void
    onSuccess: () => void
}

const MFAModal: React.FC<MFAModalProps> = ({ userId, onClose, onSuccess }) => {
    const { data: user } = UserApi.useGetUserByIdQuery(userId)
    const [updateMFA] = UserApi.useUpdateUserMutation()
    
    const [formData, setFormData] = useState<UpdateMFARequest>({
        mfa_enabled: false,
        mfa_secret: ''
    })

    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [generateNewSecret, setGenerateNewSecret] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({
                mfa_enabled: user.mfa_enabled,
                mfa_secret: user.mfa_secret || ''
            })
        }
    }, [user])

    const generateSecret = () => {
        // Generate a random base32 secret (simplified version)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
        let secret = ''
        for (let i = 0; i < 32; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData(prev => ({ ...prev, mfa_secret: secret }))
        setGenerateNewSecret(true)
    }

    const copyToClipboard = async () => {
        if (!formData.mfa_secret) return
        try {
            await navigator.clipboard.writeText(formData.mfa_secret)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!user) return

        // Validate MFA secret if enabling MFA
        if (formData.mfa_enabled && !formData.mfa_secret) {
            Swal.fire('Error!', 'MFA secret is required when enabling MFA.', 'error')
            return
        }

        setLoading(true)
        try {
            await updateMFA({
                userId,
                data: formData
            }).unwrap()
            onSuccess()
        } catch (error: any) {
            Swal.fire('Error!', error.data?.error || 'Failed to update MFA settings', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    const showSecretWarning = generateNewSecret || (!user.mfa_secret && formData.mfa_enabled)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Shield className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">MFA Settings</h2>
                                <p className="text-gray-600">Configure multi-factor authentication for {user.username}</p>
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
                        {/* MFA Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Shield className="text-gray-600" size={20} />
                                <div>
                                    <h3 className="font-medium text-gray-800">Multi-Factor Authentication</h3>
                                    <p className="text-sm text-gray-600">
                                        Require additional verification during login
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ 
                                    ...prev, 
                                    mfa_enabled: !prev.mfa_enabled 
                                }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                    formData.mfa_enabled ? 'bg-indigo-500' : 'bg-gray-300'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                    formData.mfa_enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>

                        {/* Current Status */}
                        <div className={`p-4 rounded-lg border ${
                            user.mfa_enabled 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <Shield className={user.mfa_enabled ? 'text-green-500' : 'text-gray-400'} size={20} />
                                <div>
                                    <h3 className="font-medium text-gray-800">Current Status</h3>
                                    <p className={`text-sm font-medium ${
                                        user.mfa_enabled ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                        MFA is {user.mfa_enabled ? 'enabled' : 'disabled'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* MFA Secret */}
                        {formData.mfa_enabled && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-gray-800">MFA Secret Key</h3>
                                    <button
                                        type="button"
                                        onClick={generateSecret}
                                        className="btn btn-outline btn-sm"
                                    >
                                        Generate New Secret
                                    </button>
                                </div>

                                <div className="relative">
                                    <div className="flex items-center gap-2">
                                        <Key className="text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={formData.mfa_secret}
                                            onChange={(e) => setFormData(prev => ({ 
                                                ...prev, 
                                                mfa_secret: e.target.value 
                                            }))}
                                            className="input input-bordered flex-1 font-mono text-sm"
                                            placeholder="Enter MFA secret key"
                                            required={formData.mfa_enabled}
                                        />
                                        <button
                                            type="button"
                                            onClick={copyToClipboard}
                                            className="btn btn-ghost btn-square"
                                            disabled={!formData.mfa_secret}
                                            title="Copy to clipboard"
                                        >
                                            {copied ? (
                                                <Check className="text-green-500" size={20} />
                                            ) : (
                                                <Copy size={20} />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        This secret key is used to generate time-based one-time passwords (TOTP).
                                    </p>
                                </div>

                                {/* QR Code Instructions */}
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <QrCode className="text-blue-500 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="font-medium text-blue-800">Setup Instructions</h4>
                                            <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                                                <li>Share the secret key with the user</li>
                                                <li>User scans QR code with authenticator app (Google Authenticator, Authy, etc.)</li>
                                                <li>User enters generated code to verify setup</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning */}
                                {showSecretWarning && (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <Shield className="text-yellow-500 mt-0.5" size={20} />
                                            <div>
                                                <h4 className="font-medium text-yellow-800">Important</h4>
                                                <p className="text-sm text-yellow-700 mt-1">
                                                    {generateNewSecret 
                                                        ? 'You have generated a new secret key. The user will need to update their authenticator app.'
                                                        : 'When enabling MFA, you must provide the user with this secret key for them to set up their authenticator app.'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                'Update MFA Settings'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default MFAModal