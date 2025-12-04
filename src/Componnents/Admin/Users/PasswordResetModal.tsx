// src/components/admin/PasswordResetModal.tsx
import React, { useState } from 'react'
import { X, Lock, Eye, EyeOff, Key, Shield } from 'lucide-react'
import { UserApi } from '../../../features/Api/UsersApi.ts'
import Swal from 'sweetalert2'
import { type UpdatePasswordRequest } from '../../../types/UserTypes'

interface PasswordResetModalProps {
    userId: number
    onClose: () => void
    onSuccess: () => void
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ userId, onClose, onSuccess }) => {
    const { data: user } = UserApi.useGetUserByIdQuery(userId)
    const [updatePassword] = UserApi.useUpdateUserMutation()
    
    const [formData, setFormData] = useState<UpdatePasswordRequest>({
        password_hash: '',
        password_salt: ''
    })

    const [loading, setLoading] = useState(false)
    const [showHash, setShowHash] = useState(false)
    const [showSalt, setShowSalt] = useState(false)
    const [confirmReset, setConfirmReset] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const generateRandomString = (length: number) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
        let result = ''
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    const generatePassword = () => {
        const hash = generateRandomString(64)
        const salt = generateRandomString(32)
        setFormData({
            password_hash: hash,
            password_salt: salt
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!user) return

        // Validate required fields
        if (!formData.password_hash || !formData.password_salt) {
            Swal.fire('Error!', 'Both password hash and salt are required.', 'error')
            return
        }

        if (!confirmReset) {
            Swal.fire('Warning!', 'Please confirm that you want to reset the password.', 'warning')
            return
        }

        // Show final confirmation
        const result = await Swal.fire({
            title: 'Reset Password?',
            text: `This will reset the password for ${user.username}. The user will need to use the new credentials to login.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, reset password!',
            reverseButtons: true
        })

        if (!result.isConfirmed) return

        setLoading(true)
        try {
            await updatePassword({
                userId,
                data: formData
            }).unwrap()
            
            // Log the reset (you might want to send this to your API)
            console.log(`Password reset for user ${userId}`)
            
            onSuccess()
        } catch (error: any) {
            Swal.fire('Error!', error.data?.error || 'Failed to reset password', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Lock className="text-yellow-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
                                <p className="text-gray-600">Set new password for {user.username}</p>
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
                        {/* Warning Message */}
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Lock className="text-red-500 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-medium text-red-800">Security Warning</h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        Resetting the password will invalidate the user's current password.
                                        They will need to use the new credentials immediately.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="btn btn-outline btn-sm"
                            >
                                <Key size={16} className="mr-2" />
                                Generate Secure Credentials
                            </button>
                        </div>

                        {/* Password Hash */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                <Lock size={16} className="inline mr-2" />
                                Password Hash *
                            </label>
                            <div className="relative">
                                <input
                                    type={showHash ? "text" : "password"}
                                    name="password_hash"
                                    value={formData.password_hash}
                                    onChange={handleChange}
                                    className="input input-bordered w-full pr-10 font-mono text-sm"
                                    placeholder="Enter password hash"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowHash(!showHash)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm"
                                >
                                    {showHash ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                This should be a securely hashed password value.
                            </p>
                        </div>

                        {/* Password Salt */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                <Shield size={16} className="inline mr-2" />
                                Password Salt *
                            </label>
                            <div className="relative">
                                <input
                                    type={showSalt ? "text" : "password"}
                                    name="password_salt"
                                    value={formData.password_salt}
                                    onChange={handleChange}
                                    className="input input-bordered w-full pr-10 font-mono text-sm"
                                    placeholder="Enter password salt"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSalt(!showSalt)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm"
                                >
                                    {showSalt ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                This should be the salt used during password hashing.
                            </p>
                        </div>

                        {/* Confirmation */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="confirmReset"
                                checked={confirmReset}
                                onChange={(e) => setConfirmReset(e.target.checked)}
                                className="checkbox checkbox-sm mt-1"
                            />
                            <div>
                                <label htmlFor="confirmReset" className="font-medium text-gray-800 cursor-pointer">
                                    I confirm that I want to reset the password
                                </label>
                                <p className="text-sm text-gray-600 mt-1">
                                    By checking this box, I acknowledge that the user will immediately need to use the new credentials.
                                </p>
                            </div>
                        </div>

                        {/* User Information */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-medium text-blue-800 mb-2">User Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-700">Username:</span>
                                    <span className="ml-2 font-medium">{user.username}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700">Email:</span>
                                    <span className="ml-2 font-medium">{user.email}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700">Last Password Change:</span>
                                    <span className="ml-2 font-medium">
                                        {new Date(user.password_changed_at).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-blue-700">Failed Logins:</span>
                                    <span className="ml-2 font-medium">{user.failed_login_attempts}</span>
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
                            className="btn btn-warning"
                            disabled={loading || !confirmReset}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Resetting...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PasswordResetModal