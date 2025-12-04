// CreateStaffModal.tsx
import React, { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Building, Calendar, DollarSign, Briefcase, Users } from 'lucide-react'
import { staffApi } from '../../../features/Api/staffApi'
import Swal from 'sweetalert2'

interface CreateStaffModalProps {
  isOpen: boolean
  onClose: () => void
  onStaffCreated: () => void
}

interface UserOption {
  user_id: number
  username: string
  email: string
  full_name?: string
}

const CreateStaffModal: React.FC<CreateStaffModalProps> = ({ isOpen, onClose, onStaffCreated }) => {
  const [newStaff, setNewStaff] = useState({
    user_id: '',
    employee_id: '',
    hire_date: '',
    branch_id: '',
    job_title: '',
    department: '',
    salary: '',
    employment_type: 'Full-Time',
    permissions: [] as string[],
    assigned_vehicles: [] as string[],
    notes: ''
  })

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch available users for staff assignment
  const { data: usersData } = staffApi.useGetAllStaffDetailsQuery()
  const [createStaff] = staffApi.useCreateStaffMutation()

  // Get available branches and departments from filters
  const { data: filtersData } = staffApi.useGetStaffFiltersQuery()
  const availableFilters = filtersData || {
    branches: [],
    departments: [],
    job_titles: []
  }

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setNewStaff({
        user_id: '',
        employee_id: '',
        hire_date: '',
        branch_id: '',
        job_title: '',
        department: '',
        salary: '',
        employment_type: 'Full-Time',
        permissions: [],
        assigned_vehicles: [],
        notes: ''
      })
      setFormErrors({})
    }
  }, [isOpen])

  // Form validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!newStaff.user_id) errors.user_id = 'User selection is required'
    if (!newStaff.employee_id) errors.employee_id = 'Employee ID is required'
    if (!newStaff.hire_date) errors.hire_date = 'Hire date is required'
    if (!newStaff.branch_id) errors.branch_id = 'Branch selection is required'
    if (!newStaff.job_title) errors.job_title = 'Job title is required'
    if (!newStaff.department) errors.department = 'Department is required'
    if (!newStaff.salary || Number(newStaff.salary) <= 0) errors.salary = 'Valid salary is required'
    if (!newStaff.employment_type) errors.employment_type = 'Employment type is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setNewStaff(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCreateStaff = async () => {
    if (!validateForm()) {
      Swal.fire('Validation Error', 'Please fill in all required fields correctly.', 'warning')
      return
    }

    setIsSubmitting(true)

    try {
      const staffData = {
        ...newStaff,
        salary: Number(newStaff.salary),
        branch_id: Number(newStaff.branch_id),
        user_id: Number(newStaff.user_id)
      }

      await createStaff(staffData).unwrap()
      
      Swal.fire({
        title: 'Success!',
        text: 'Staff member created successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })

      onStaffCreated()
      onClose()
    } catch (error: any) {
      console.error('Failed to create staff:', error)
      Swal.fire({
        title: 'Error!',
        text: error?.data?.message || 'Failed to create staff member. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-purple-600" size={24} />
            <h3 className="text-lg font-bold">Add New Staff Member</h3>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-circle"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <User size={18} />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Select User <span className="text-red-500">*</span></span>
                  </label>
                  <select 
                    className={`select select-bordered w-full ${formErrors.user_id ? 'select-error' : ''}`}
                    value={newStaff.user_id}
                    onChange={(e) => handleInputChange('user_id', e.target.value)}
                  >
                    <option value="">Choose a user</option>
                    {usersData?.map((user: any) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.username} - {user.email}
                      </option>
                    ))}
                  </select>
                  {formErrors.user_id && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.user_id}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Employee ID <span className="text-red-500">*</span></span>
                  </label>
                  <input 
                    type="text" 
                    className={`input input-bordered w-full ${formErrors.employee_id ? 'input-error' : ''}`}
                    placeholder="e.g., EMP001"
                    value={newStaff.employee_id}
                    onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  />
                  {formErrors.employee_id && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.employee_id}</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Information Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Briefcase size={18} />
                Employment Information
              </h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Hire Date <span className="text-red-500">*</span></span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="date" 
                      className={`input input-bordered w-full pl-10 ${formErrors.hire_date ? 'input-error' : ''}`}
                      value={newStaff.hire_date}
                      onChange={(e) => handleInputChange('hire_date', e.target.value)}
                    />
                  </div>
                  {formErrors.hire_date && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.hire_date}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Branch <span className="text-red-500">*</span></span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                      className={`select select-bordered w-full pl-10 ${formErrors.branch_id ? 'select-error' : ''}`}
                      value={newStaff.branch_id}
                      onChange={(e) => handleInputChange('branch_id', e.target.value)}
                    >
                      <option value="">Select Branch</option>
                      {availableFilters.branches?.map((branch: string, index: number) => (
                        <option key={index} value={index + 1}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  {formErrors.branch_id && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.branch_id}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Job Title <span className="text-red-500">*</span></span>
                  </label>
                  <select 
                    className={`select select-bordered w-full ${formErrors.job_title ? 'select-error' : ''}`}
                    value={newStaff.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                  >
                    <option value="">Select Job Title</option>
                    {availableFilters.job_titles?.map((title: string) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                    <option value="Other">Other (Specify in notes)</option>
                  </select>
                  {formErrors.job_title && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.job_title}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Department <span className="text-red-500">*</span></span>
                  </label>
                  <select 
                    className={`select select-bordered w-full ${formErrors.department ? 'select-error' : ''}`}
                    value={newStaff.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {availableFilters.departments?.map((dept: string) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="Other">Other (Specify in notes)</option>
                  </select>
                  {formErrors.department && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.department}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Employment Type <span className="text-red-500">*</span></span>
                  </label>
                  <select 
                    className={`select select-bordered w-full ${formErrors.employment_type ? 'select-error' : ''}`}
                    value={newStaff.employment_type}
                    onChange={(e) => handleInputChange('employment_type', e.target.value)}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                  {formErrors.employment_type && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.employment_type}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Salary <span className="text-red-500">*</span></span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="number" 
                      className={`input input-bordered w-full pl-10 ${formErrors.salary ? 'input-error' : ''}`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={newStaff.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                    />
                  </div>
                  {formErrors.salary && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.salary}</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Additional Information</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Permissions</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['read', 'write', 'delete', 'admin', 'reports'].map(permission => (
                      <label key={permission} className="cursor-pointer label justify-start gap-2">
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-sm"
                          checked={newStaff.permissions.includes(permission)}
                          onChange={(e) => {
                            const updatedPermissions = e.target.checked
                              ? [...newStaff.permissions, permission]
                              : newStaff.permissions.filter(p => p !== permission)
                            setNewStaff(prev => ({ ...prev, permissions: updatedPermissions }))
                          }}
                        />
                        <span className="label-text capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Notes</span>
                  </label>
                  <textarea 
                    className="textarea textarea-bordered w-full h-24"
                    placeholder="Additional notes about this staff member..."
                    value={newStaff.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-action mt-6 border-t pt-4">
          <button 
            onClick={onClose} 
            className="btn btn-ghost"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateStaff} 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating...
              </>
            ) : (
              'Create Staff Member'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateStaffModal