// src/components/admin/CreateBranchModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Building2,  Phone, Clock, Check, X as XIcon } from 'lucide-react'
import { BranchApi } from '../../../features/Api/BranchApi'
import Swal from 'sweetalert2'
import {type CreateBranchRequest } from '../../../types/Branchtypes'

interface CreateBranchModalProps {
    onClose: () => void
    onSuccess: () => void
}

const CreateBranchModal: React.FC<CreateBranchModalProps> = ({ onClose, onSuccess }) => {
    const [createBranch] = BranchApi.useCreateBranchMutation()
    const { data: existingBranches } = BranchApi.useGetAllBranchesQuery()
    const [checkBranchName, { data: nameAvailability }] = BranchApi.useLazyCheckBranchNameAvailabilityQuery()
    
    const [formData, setFormData] = useState<CreateBranchRequest>({
        branch_name: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        manager_id: undefined,
        opening_hours: '',
        is_active: true
    })

    const [cities, setCities] = useState<string[]>([])
    const [nameChecked, setNameChecked] = useState(false)

    useEffect(() => {
        if (existingBranches) {
            const uniqueCities = Array.from(new Set(existingBranches.map(b => b.city)))
            setCities(uniqueCities)
        }
    }, [existingBranches])

    useEffect(() => {
        if (formData.branch_name.length > 2) {
            const timer = setTimeout(() => {
                checkBranchName(formData.branch_name)
                setNameChecked(true)
            }, 500)
            return () => clearTimeout(timer)
        } else {
            setNameChecked(false)
        }
    }, [formData.branch_name, checkBranchName])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'manager_id' ? (value ? Number(value) : undefined) : value
        }))
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '')
        const formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
        setFormData(prev => ({ ...prev, phone: formattedValue }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate required fields
        if (!formData.branch_name || !formData.address || !formData.city) {
            Swal.fire('Error!', 'Please fill in all required fields.', 'error')
            return
        }

        // Check name availability
        if (nameAvailability && !nameAvailability.available) {
            Swal.fire('Error!', 'Branch name is already taken. Please choose a different name.', 'error')
            return
        }

        // Validate email format if provided
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            Swal.fire('Error!', 'Please enter a valid email address.', 'error')
            return
        }

        try {
            const submissionData = {
                ...formData,
                phone: formData.phone || undefined,
                email: formData.email || undefined,
                manager_id: formData.manager_id || undefined,
                opening_hours: formData.opening_hours || undefined
            }
            
            await createBranch(submissionData).unwrap()
            onSuccess()
        } catch (error) {
            Swal.fire('Error!', 'Failed to create branch.', 'error')
        }
    }

    const isNameValid = nameChecked && nameAvailability?.available
    const isNameInvalid = nameChecked && !nameAvailability?.available

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Create New Branch</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Building2 size={20} />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Branch Name *</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="branch_name"
                                                value={formData.branch_name}
                                                onChange={handleInputChange}
                                                className={`input input-bordered w-full ${
                                                    isNameValid ? 'input-success' : 
                                                    isNameInvalid ? 'input-error' : ''
                                                }`}
                                                placeholder="Enter branch name"
                                                required
                                            />
                                            {nameChecked && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    {isNameValid ? (
                                                        <Check className="text-green-500" size={20} />
                                                    ) : isNameInvalid ? (
                                                        <XIcon className="text-red-500" size={20} />
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                        {nameChecked && (
                                            <div className="text-sm mt-1">
                                                {isNameValid ? (
                                                    <span className="text-green-600">Branch name is available</span>
                                                ) : isNameInvalid ? (
                                                    <span className="text-red-600">Branch name is already taken</span>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">City *</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            list="cities"
                                            placeholder="Enter city"
                                            required
                                        />
                                        <datalist id="cities">
                                            {cities.map(city => (
                                                <option key={city} value={city} />
                                            ))}
                                        </datalist>
                                    </div>

                                    <div className="form-control md:col-span-2">
                                        <label className="label">
                                            <span className="label-text font-semibold">Address *</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="Full street address"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Phone size={20} />
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Phone Number</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            className="input input-bordered"
                                            placeholder="(555) 123-4567"
                                            maxLength={14}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Email</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="branch@company.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Operational Details */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Clock size={20} />
                                    Operational Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Opening Hours</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="opening_hours"
                                            value={formData.opening_hours}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="e.g., Mon-Fri 9:00-18:00, Sat 10:00-16:00"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Manager ID</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="manager_id"
                                            value={formData.manager_id || ''}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="Staff ID for manager"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
                                <div className="form-control">
                                    <label className="label cursor-pointer justify-start gap-3">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                is_active: e.target.checked
                                            }))}
                                            className="checkbox checkbox-primary"
                                        />
                                        <span className="label-text font-semibold">Active Branch</span>
                                    </label>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Active branches can accept bookings and vehicle assignments
                                    </div>
                                </div>
                            </div>
                        </div>
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
                            disabled={isNameInvalid}
                        >
                            Create Branch
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateBranchModal