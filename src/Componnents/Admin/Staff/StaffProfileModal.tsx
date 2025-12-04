// StaffProfileModal.tsx
import React from 'react'
import { Mail, Phone, Building, Calendar, Briefcase, DollarSign, MapPin } from 'lucide-react'

interface StaffProfileModalProps {
  staff: any
  onClose: () => void
}

const StaffProfileModal: React.FC<StaffProfileModalProps> = ({ staff, onClose }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatSalary = (salary: number) => {
    return `$${salary?.toLocaleString() || '0'}`
  }

  if (!staff) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg mb-4">Staff Profile - {staff.username}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>
                  <p className="font-medium">{staff.username}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{staff.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <p className="font-medium">{staff.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Employee ID</label>
                  <p className="font-medium">{staff.employee_id}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mt-4">
              <h4 className="font-semibold mb-4">Employment Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Job Title</label>
                  <p className="font-medium">{staff.job_title}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Department</label>
                  <p className="font-medium">{staff.department}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Hire Date</label>
                  <p className="font-medium">{formatDate(staff.hire_date)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Salary</label>
                  <p className="font-medium">{formatSalary(staff.salary)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Quick Stats</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <span className={`badge ${staff.termination_date ? 'badge-error' : 'badge-success'}`}>
                    {staff.termination_date ? 'Terminated' : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Employment Type:</span>
                  <span className="badge badge-info">{staff.employment_type}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Branch Information</h5>
              <p className="text-sm">{staff.branch_name || 'Unassigned'}</p>
            </div>
          </div>
        </div>
        <div className="modal-action">
          <button onClick={onClose} className="btn">Close</button>
        </div>
      </div>
    </div>
  )
}

export default StaffProfileModal