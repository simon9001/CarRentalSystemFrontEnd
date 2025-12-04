// StaffTable.tsx
import React, { useState } from 'react'
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  UserX, 
  Trash2, 
  User, 
  Users, 
  XCircle, 
  CheckCircle, 
  Mail, 
  Phone, 
  Building 
} from 'lucide-react'
import { staffApi } from '../../../features/Api/staffApi'
import Swal from 'sweetalert2'
import StaffProfileModal from './StaffProfileModal'

interface StaffTableProps {
  staff: any[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  onRefetch: () => void
}

const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  currentPage,
  itemsPerPage,
  totalPages,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  onRefetch
}) => {
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const [terminateStaff] = staffApi.useTerminateStaffMutation()
  const [reactivateStaff] = staffApi.useReactivateStaffMutation()
  const [deleteStaff] = staffApi.useDeleteStaffMutation()

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format salary
  const formatSalary = (salary: number) => {
    return `$${salary?.toLocaleString() || '0'}`
  }

  // Get status badge
  const getStatusBadge = (terminationDate: string | null) => {
    if (terminationDate) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle size={14} className="mr-1" />
          Terminated
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle size={14} className="mr-1" />
          Active
        </span>
      )
    }
  }

  // Get employment type badge
  const getEmploymentTypeBadge = (employmentType: string) => {
    const typeConfig = {
      'Full-Time': { color: 'bg-blue-100 text-blue-800', label: 'Full-Time' },
      'Part-Time': { color: 'bg-purple-100 text-purple-800', label: 'Part-Time' },
      'Contract': { color: 'bg-orange-100 text-orange-800', label: 'Contract' },
    }

    const config = typeConfig[employmentType as keyof typeof typeConfig] || typeConfig['Full-Time']
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  // Handle termination
  const handleTerminate = async (staffId: number, staffName: string) => {
    const result = await Swal.fire({
      title: 'Terminate Staff?',
      text: `Are you sure you want to terminate ${staffName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, terminate!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await terminateStaff({
          staff_id: staffId,
          termination_date: new Date().toISOString().split('T')[0]
        }).unwrap()
        Swal.fire('Terminated!', 'Staff has been terminated.', 'success')
        onRefetch()
      } catch (error) {
        Swal.fire('Error!', 'Failed to terminate staff.', 'error')
      }
    }
  }

  // Handle reactivation
  const handleReactivate = async (staffId: number, staffName: string) => {
    const result = await Swal.fire({
      title: 'Reactivate Staff?',
      text: `Are you sure you want to reactivate ${staffName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, reactivate!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await reactivateStaff(staffId).unwrap()
        Swal.fire('Reactivated!', 'Staff has been reactivated.', 'success')
        onRefetch()
      } catch (error) {
        Swal.fire('Error!', 'Failed to reactivate staff.', 'error')
      }
    }
  }

  // Handle delete
  const handleDelete = async (staffId: number, staffName: string) => {
    const result = await Swal.fire({
      title: 'Delete Staff?',
      text: `Are you sure you want to permanently delete ${staffName}? This action cannot be undone.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await deleteStaff(staffId).unwrap()
        Swal.fire('Deleted!', 'Staff has been deleted.', 'success')
        onRefetch()
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete staff.', 'error')
      }
    }
  }

  // View staff profile
  const handleViewProfile = (staff: any) => {
    setSelectedStaff(staff)
    setShowProfileModal(true)
  }

  if (!staff || staff.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Users className="mx-auto mb-4 text-purple-600" size={48} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Staff Found</h3>
        <p className="text-gray-500">No staff members match your search criteria.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left font-semibold text-gray-700">Staff ID</th>
                <th className="text-left font-semibold text-gray-700">Staff Member</th>
                <th className="text-left font-semibold text-gray-700">Contact</th>
                <th className="text-left font-semibold text-gray-700">Position</th>
                <th className="text-left font-semibold text-gray-700">Branch</th>
                <th className="text-left font-semibold text-gray-700">Employment</th>
                <th className="text-left font-semibold text-gray-700">Salary</th>
                <th className="text-left font-semibold text-gray-700">Hire Date</th>
                <th className="text-left font-semibold text-gray-700">Status</th>
                <th className="text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((staffMember) => (
                <tr key={staffMember.staff_id} className="hover:bg-gray-50">
                  <td className="font-bold text-gray-800">#{staffMember.staff_id}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-purple-100 text-purple-800 rounded-full w-10">
                          <User className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{staffMember.username || staffMember.full_name}</div>
                        <div className="text-sm text-gray-500">{staffMember.employee_id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Mail size={14} />
                        {staffMember.email}
                      </div>
                      {staffMember.phone_number && (
                        <div className="flex items-center gap-1 mt-1 text-gray-500">
                          <Phone size={12} />
                          {staffMember.phone_number}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="font-medium text-gray-800">{staffMember.job_title || 'Not specified'}</div>
                      <div className="text-sm text-gray-500">{staffMember.department || 'No department'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Building size={14} />
                      {staffMember.branch_name || 'Unassigned'}
                    </div>
                  </td>
                  <td>
                    {getEmploymentTypeBadge(staffMember.employment_type)}
                  </td>
                  <td className="font-bold text-green-600">
                    {formatSalary(staffMember.salary)}
                  </td>
                  <td className="text-sm text-gray-600">
                    {formatDate(staffMember.hire_date)}
                  </td>
                  <td>
                    {getStatusBadge(staffMember.termination_date)}
                  </td>
                  <td className="text-center">
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
                        <MoreVertical className="w-4 h-4" />
                      </label>
                      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
                        <li>
                          <button 
                            onClick={() => handleViewProfile(staffMember)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                            View Profile
                          </button>
                        </li>
                        <li>
                          <button className="text-green-600 hover:bg-green-50">
                            <Edit className="w-4 h-4" />
                            Edit Details
                          </button>
                        </li>
                        
                        {/* Termination/Reactivation Options */}
                        {!staffMember.termination_date ? (
                          <li>
                            <button 
                              onClick={() => handleTerminate(staffMember.staff_id, staffMember.username || staffMember.full_name || 'this staff member')}
                              className="text-orange-600 hover:bg-orange-50"
                            >
                              <UserX className="w-4 h-4" />
                              Terminate
                            </button>
                          </li>
                        ) : (
                          <li>
                            <button 
                              onClick={() => handleReactivate(staffMember.staff_id, staffMember.username || staffMember.full_name || 'this staff member')}
                              className="text-green-600 hover:bg-green-50"
                            >
                              <User className="w-4 h-4" />
                              Reactivate
                            </button>
                          </li>
                        )}
                        
                        <li>
                          <button 
                            onClick={() => handleDelete(staffMember.staff_id, staffMember.username || staffMember.full_name || 'this staff member')}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Permanently
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <select 
                className="select select-bordered select-sm"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
              </span>
            </div>
            
            <div className="join">
              <button 
                className="join-item btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                «
              </button>
              <button className="join-item btn btn-sm">Page {currentPage}</button>
              <button 
                className="join-item btn btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Profile Modal */}
      {showProfileModal && (
        <StaffProfileModal 
          staff={selectedStaff}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  )
}

export default StaffTable