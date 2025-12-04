// src/components/admin/EditCustomerModal.tsx
import React, { useState, useEffect } from 'react'
import { X, User, Mail, Phone, IdCard, Car, Shield, CreditCard, Award, Calendar } from 'lucide-react'
import { CustomerApi } from '../../../features/Api/CustomerApi'
import Swal from 'sweetalert2'
import { type UpdateCustomerRequest } from '../../../types/CustomerTypes'

interface EditCustomerModalProps {
    customerId: number
    onClose: () => void
    onSuccess: () => void
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ customerId, onClose, onSuccess }) => {
    const { data: customer, isLoading } = CustomerApi.useGetCustomerByIdQuery(customerId)
    const [updateCustomer] = CustomerApi.useUpdateCustomerMutation()
    
    const [formData, setFormData] = useState<UpdateCustomerRequest>({
        national_id: '',
        drivers_license_number: '',
        license_expiry: '',
        license_issue_date: '',
        license_issuing_authority: '',
        account_status: 'Active',
        verification_status: 'Pending',
        verification_notes: '',
        preferred_payment_method: '',
        marketing_opt_in: false
    })

    useEffect(() => {
        if (customer) {
            setFormData({
                national_id: customer.national_id || '',
                drivers_license_number: customer.drivers_license_number,
                license_expiry: customer.license_expiry,
                license_issue_date: customer.license_issue_date || '',
                license_issuing_authority: customer.license_issuing_authority || '',
                account_status: customer.account_status,
                verification_status: customer.verification_status,
                verification_notes: customer.verification_notes || '',
                preferred_payment_method: customer.preferred_payment_method || '',
                marketing_opt_in: customer.marketing_opt_in
            })
        }
    }, [customer])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate required fields
        if (!formData.drivers_license_number || !formData.license_expiry) {
            Swal.fire('Error!', 'Please fill in all required fields.', 'error')
            return
        }

        // Validate license expiry date
        if (formData.license_expiry && new Date(formData.license_expiry) < new Date()) {
            const result = await Swal.fire({
                title: 'License Expired?',
                text: 'License expiry date is in the past. Are you sure you want to proceed?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, proceed',
                cancelButtonText: 'No, go back'
            })
            
            if (!result.isConfirmed) {
                return
            }
        }

        try {
            await updateCustomer({ customer_id: customerId, updates: formData }).unwrap()
            onSuccess()
        } catch (error) {
            Swal.fire('Error!', 'Failed to update customer.', 'error')
        }
    }

    const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash']

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-8">
                    <span className="loading loading-spinner loading-lg text-purple-600"></span>
                </div>
            </div>
        )
    }

    if (!customer) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                        Edit Customer - {customer.username}
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-6">
                            {/* Customer Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <User size={20} />
                                    Customer Information
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <div className="text-sm text-gray-600">Username</div>
                                            <div className="font-semibold">{customer.username}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Email</div>
                                            <div className="font-semibold">{customer.email}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Phone</div>
                                            <div className="font-semibold">{customer.phone_number}</div>
                                        </div>
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
                            Update Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditCustomerModal