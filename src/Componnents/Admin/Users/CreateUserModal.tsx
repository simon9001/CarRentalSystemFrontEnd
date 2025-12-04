// src/components/admin/CreateUserModal.tsx
import React, { useState } from 'react'
import { X, User, Mail, Lock, Phone, Home, Shield } from 'lucide-react'
import { UserApi } from  '../../../features/Api/UsersApi.ts'
import Swal from 'sweetalert2'

interface CreateUserModalProps {
    onClose: () => void
    onSuccess: () => void
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSuccess }) => {
    const [createUser] = UserApi.useCreateUserMutation()
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password_hash: '',
        password_salt: '',
        phone_number: '',
        address: '',
        role: 'Customer'
    })

    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate required fields
        if (!formData.username || !formData.email || !formData.password_hash || !formData.password_salt) {
            Swal.fire('Error!', 'Please fill in all required fields.', 'error')
            return
        }

        setLoading(true)
        try {
            await createUser(formData).unwrap()
            onSuccess()
        } catch (error: any) {
            Swal.fire('Error!', error.data?.error || 'Failed to create user', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Create New User</h2>
                                <p className="text-gray-600">Add a new user to the system</p>
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
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                <User size={16} className="inline mr-2" />
                                Username *
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                placeholder="Enter username"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                <Mail size={16} className="inline mr-2" />
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                placeholder="user@example.com"
                                required
                            />
                        </div>

                        {/* Password Hash */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                <Lock size={16} className="inline mr-2" />
                                Password Hash *
                            </label>
                            <input
                                type="password"
                                name="password_hash"
                                value={formData.password_hash}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                placeholder="Enter password hash"
                                required
                            />
                        </div>

                        {/* Password Salt */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                <Shield size={16} className="inline mr-2" />
                                Password Salt *
                            </label>
                            <input
                                type="password"
                                name="password_salt"
                                value={formData.password_salt}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                placeholder="Enter password salt"
                                required
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                <Phone size={16} className="inline mr-2" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                placeholder="+1234567890"
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                <Shield size={16} className="inline mr-2" />
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                            >
                                <option value="Customer">Customer</option>
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Agent">Agent</option>
                            </select>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            <Home size={16} className="inline mr-2" />
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full"
                            placeholder="Enter full address"
                            rows={3}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
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
                                    Creating...
                                </>
                            ) : (
                                'Create User'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateUserModal