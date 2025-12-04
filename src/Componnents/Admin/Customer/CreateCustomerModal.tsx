// src/components/admin/CreateCustomerModal.tsx
import React, { useState } from 'react'
import { X, User, Mail, Phone, IdCard, Car, Shield, CreditCard, Award, Calendar } from 'lucide-react'
import { CustomerApi } from '../../../features/Api/CustomerApi'
import Swal from 'sweetalert2'
import { type CreateCustomerRequest } from '../../../types/CustomerTypes'

interface CreateCustomerModalProps {
    onClose: () => void
    onSuccess: () => void
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({ onClose, onSuccess }) => {
    const [createCustomer] = CustomerApi.useCreateCustomerMutation()
    
    const [formData, setFormData] = useState<CreateCustomerRequest>({
        customer_id: 0,
        drivers_license_number: '',
        license_expiry: '',
        national_id: '',
        license_issue_date: '',
        license_issuing_authority: '',
        account_status: 'Active',
        verification_status: 'Pending',
        verification_notes: '',
        preferred_payment_method: '',
        marketing_opt_in: false
    })

    const [userData, setUserData] = useState({
        username: '',
        email: '',
        phone_number: ''
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'customer_id' ? Number(value) : value
        }))
    }

    const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUserData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate required fields
        if (!formData.customer_id || !formData.drivers_license_number || !formData.license_expiry) {
            Swal.fire('Error!', 'Please fill in all required fields.', 'error')
            return
        }

        // Validate license expiry date
        if (formData.license_expiry && new Date(formData.license_expiry) < new Date()) {
            Swal.fire('Warning!', 'License expiry date is in the past. Please check the date.', 'warning')
            return
        }

        try {
            await createCustomer(formData).unwrap()
            onSuccess()
        } catch (error) {
            Swal.fire('Error!', 'Failed to create customer. Please check if the customer ID exists.', 'error')
        }
    }

    const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash']

    // Calculate minimum and maximum dates for license
    const today = new Date().toISOString().split('T')[0]
    const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString().split('T')[0]

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Create New Customer</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-6">
                            {/* User Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <User size={20} />
                                    User Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Customer ID *</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="customer_id"
                                            value={formData.customer_id}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="User ID from Users table"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Username</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={userData.username}
                                            onChange={handleUserInputChange}
                                            className="input input-bordered"
                                            placeholder="Username (for reference)"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Email</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={userData.email}
                                            onChange={handleUserInputChange}
                                            className="input input-bordered"
                                            placeholder="Email (for reference)"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* License Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Car size={20} />
                                    License Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">License Number *</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="drivers_license_number"
                                            value={formData.drivers_license_number}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="Driver's license number"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">License Expiry *</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="license_expiry"
                                            value={formData.license_expiry}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            min={today}
                                            max={maxDate}
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">License Issue Date</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="license_issue_date"
                                            value={formData.license_issue_date}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            max={today}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Issuing Authority</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="license_issuing_authority"
                                            value={formData.license_issuing_authority}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="e.g., DMV, DVLA"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">National ID</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="national_id"
                                            value={formData.national_id}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="National identification number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Account Settings */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <CreditCard size={20} />
                                    Account Settings
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Account Status</span>
                                        </label>
                                        <select 
                                            name="account_status"
                                            value={formData.account_status}
                                            onChange={handleInputChange}
                                            className="select select-bordered"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Suspended">Suspended</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Verification Status</span>
                                        </label>
                                        <select 
                                            name="verification_status"
                                            value={formData.verification_status}
                                            onChange={handleInputChange}
                                            className="select select-bordered"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Verified">Verified</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Preferred Payment</span>
                                        </label>
                                        <select 
                                            name="preferred_payment_method"
                                            value={formData.preferred_payment_method}
                                            onChange={handleInputChange}
                                            className="select select-bordered"
                                        >
                                            <option value="">Select Payment Method</option>
                                            {paymentMethods.map(method => (
                                                <option key={method} value={method}>{method}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Verification Notes</span>
                                        </label>
                                        <textarea
                                            name="verification_notes"
                                            value={formData.verification_notes}
                                            onChange={handleInputChange}
                                            className="textarea textarea-bordered h-20"
                                            placeholder="Any notes about verification..."
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label cursor-pointer justify-start gap-3">
                                            <input
                                                type="checkbox"
                                                name="marketing_opt_in"
                                                checked={formData.marketing_opt_in}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    marketing_opt_in: e.target.checked
                                                }))}
                                                className="checkbox checkbox-primary"
                                            />
                                            <span className="label-text font-semibold">Marketing Opt-in</span>
                                        </label>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Customer agrees to receive marketing communications
                                        </div>
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
                        >
                            Create Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateCustomerModal