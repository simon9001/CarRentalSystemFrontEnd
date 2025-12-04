// src/components/admin/EditBranchModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Building2, Phone,Clock, Check, X as XIcon, AlertTriangle } from 'lucide-react'
import { BranchApi } from '../../../features/Api/BranchApi'
import Swal from 'sweetalert2'
import { type UpdateBranchRequest } from '../../../types/Branchtypes'

interface EditBranchModalProps {
    branchId: number
    onClose: () => void
    onSuccess: () => void
}

const EditBranchModal: React.FC<EditBranchModalProps> = ({ branchId, onClose, onSuccess }) => {
    const { data: branch, isLoading } = BranchApi.useGetBranchByIdQuery(branchId)
    const { data: existingBranches } = BranchApi.useGetAllBranchesQuery()
    const [updateBranch] = BranchApi.useUpdateBranchMutation()
    const [checkBranchName, { data: nameAvailability }] = BranchApi.useLazyCheckBranchNameAvailabilityQuery()
    
    const [formData, setFormData] = useState<UpdateBranchRequest>({
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
    const [nameChanged, setNameChanged] = useState(false)
    const [nameChecked, setNameChecked] = useState(false)

    useEffect(() => {
        if (existingBranches) {
            const uniqueCities = Array.from(new Set(existingBranches.map(b => b.city)))
            setCities(uniqueCities)
        }
    }, [existingBranches])

    useEffect(() => {
        if (branch) {
            setFormData({
                branch_name: branch.branch_name,
                address: branch.address,
                city: branch.city,
                phone: branch.phone || '',
                email: branch.email || '',
                manager_id: branch.manager_id || undefined,
                opening_hours: branch.opening_hours || '',
                is_active: branch.is_active
            })
        }
    }, [branch])

    useEffect(() => {
        if (nameChanged && formData.branch_name.length > 2 && formData.branch_name !== branch?.branch_name) {
            const timer = setTimeout(() => {
                checkBranchName(formData.branch_name)
                setNameChecked(true)
            }, 500)
            return () => clearTimeout(timer)
        } else {
            setNameChecked(false)
        }
    }, [formData.branch_name, nameChanged, branch, checkBranchName])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        if (name === 'branch_name' && !nameChanged) {
            setNameChanged(true)
        }
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
        
        if (!branch) return

        // Validate required fields
        if (!formData.branch_name || !formData.address || !formData.city) {
            Swal.fire('Error!', 'Please fill in all required fields.', 'error')
            return
        }

        // Check name availability if changed
        if (nameChanged && nameAvailability && !nameAvailability.available) {
            Swal.fire('Error!', 'Branch name is already taken. Please choose a different name.', 'error')
            return
        }

        // Validate email format if provided
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            Swal.fire('Error!', 'Please enter a valid email address.', 'error')
            return
        }

        // Show warning when deactivating a branch
        if (branch.is_active && !formData.is_active) {
            const result = await Swal.fire({
                title: 'Deactivate Branch?',
                text: 'Deactivating this branch will affect existing bookings and vehicle assignments. Are you sure?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, deactivate it!',
                cancelButtonText: 'Cancel'
            })

            if (!result.isConfirmed) {
                return
            }
        }

        try {
            const submissionData: UpdateBranchRequest = {}
            
            // Only include changed fields
            if (formData.branch_name !== branch.branch_name) submissionData.branch_name = formData.branch_name
            if (formData.address !== branch.address) submissionData.address = formData.address
            if (formData.city !== branch.city) submissionData.city = formData.city
            if (formData.phone !== branch.phone) submissionData.phone = formData.phone || 'number'
            if (formData.email !== branch.email) submissionData.email = formData.email || 'string'
            if (formData.manager_id !== branch.manager_id) submissionData.manager_id = formData.manager_id
            if (formData.opening_hours !== branch.opening_hours) submissionData.opening_hours = formData.opening_hours || undefined
            if (formData.is_active !== branch.is_active) submissionData.is_active = formData.is_active

            // If no changes, show info and return
            if (Object.keys(submissionData).length === 0) {
                Swal.fire('Info!', 'No changes made to the branch.', 'info')
                onClose()
                return
            }

            await updateBranch({ branch_id: branchId, updates: submissionData }).unwrap()
            onSuccess()
        } catch (error) {
            Swal.fire('Error!', 'Failed to update branch.', 'error')
        }
    }

    const isNameValid = !nameChanged || (nameChecked && nameAvailability?.available)
    const isNameInvalid = nameChanged && nameChecked && !nameAvailability?.available

    const hasChanges = branch && (
        formData.branch_name !== branch.branch_name ||
        formData.address !== branch.address ||
        formData.city !== branch.city ||
        formData.phone !== branch.phone ||
        formData.email !== branch.email ||
        formData.manager_id !== branch.manager_id ||
        formData.opening_hours !== branch.opening_hours ||
        formData.is_active !== branch.is_active
    )

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-8">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                </div>
            </div>
        )
    }

    if (!branch) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                        Edit Branch - {branch.branch_name}
                    </h2>
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
                                    {branch.is_active && !formData.is_active && (
                                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-center gap-2 text-yellow-700">
                                                <AlertTriangle size={16} />
                                                <span className="font-medium">Warning</span>
                                            </div>
                                            <p className="text-sm text-yellow-600 mt-1">
                                                Deactivating this branch will affect existing bookings and vehicle assignments.
                                            </p>
                                        </div>
                                    )}
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
                            disabled={!hasChanges || isNameInvalid}
                        >
                            Update Branch
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditBranchModal