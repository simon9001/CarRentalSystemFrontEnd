// components/damage/DamageTable.tsx
import React, { useState } from 'react'
import { MoreVertical, Eye, Edit, Trash2, Car, User, Calendar, DollarSign } from 'lucide-react'
import { DamageApi } from '../../../features/Api/DamageApi'
import Swal from 'sweetalert2'
import DamageReportModal from './DamageReportModal'

interface DamageTableProps {
  reports: any[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  onRefetch: () => void
}

const DamageTable: React.FC<DamageTableProps> = ({
  reports,
  currentPage,
  itemsPerPage,
  totalPages,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  onRefetch
}) => {
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [showReportModal, setShowReportModal] = useState(false)

  const [updateDamageReportStatus] = DamageApi.useUpdateDamageReportStatusMutation()
  const [deleteDamageReport] = DamageApi.useDeleteDamageReportMutation()

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: string } = {
      'Reported': 'badge-warning',
      'Assessed': 'badge-info',
      'Repaired': 'badge-secondary',
      'Closed': 'badge-success'
    }
    return statusConfig[status] || 'badge-neutral'
  }

  // Handle status change
  const handleStatusChange = async (incidentId: number, newStatus: string, currentStatus: string) => {
    if (newStatus === currentStatus) return

    const result = await Swal.fire({
      title: 'Update Status?',
      text: `Change status from ${currentStatus} to ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Update Status',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await updateDamageReportStatus({
          incident_id: incidentId,
          status: newStatus
        }).unwrap()
        Swal.fire('Updated!', 'Status has been updated.', 'success')
        onRefetch()
      } catch (error) {
        Swal.fire('Error!', 'Failed to update status.', 'error')
      }
    }
  }

  // Handle delete
  const handleDelete = async (incidentId: number, incidentDescription: string) => {
    const result = await Swal.fire({
      title: 'Delete Damage Report?',
      text: `Are you sure you want to delete report for "${incidentDescription}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await deleteDamageReport(incidentId).unwrap()
        Swal.fire('Deleted!', 'Damage report has been deleted.', 'success')
        onRefetch()
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete damage report.', 'error')
      }
    }
  }

  // View report details
  const handleViewReport = (report: any) => {
    setSelectedReport(report)
    setShowReportModal(true)
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Car className="mx-auto mb-4 text-orange-600" size={48} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Damage Reports Found</h3>
        <p className="text-gray-500">No damage reports match your search criteria.</p>
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
                <th className="text-left font-semibold text-gray-700">Incident ID</th>
                <th className="text-left font-semibold text-gray-700">Vehicle</th>
                <th className="text-left font-semibold text-gray-700">Customer</th>
                <th className="text-left font-semibold text-gray-700">Booking ID</th>
                <th className="text-left font-semibold text-gray-700">Date Recorded</th>
                <th className="text-left font-semibold text-gray-700">Damage Cost</th>
                <th className="text-left font-semibold text-gray-700">Status</th>
                <th className="text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.incident_id} className="hover:bg-gray-50">
                  <td className="font-bold text-gray-800">#{report.incident_id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Car size={14} className="text-gray-400" />
                      <div>
                        <div className="font-medium">{report.make} {report.model}</div>
                        <div className="text-xs text-gray-500">{report.registration_number}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <div>
                        <div className="font-medium">{report.customer_name}</div>
                        <div className="text-xs text-gray-500">{report.customer_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-sm">#{report.booking_id}</td>
                  <td className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(report.date_recorded)}
                    </div>
                  </td>
                  <td className="font-bold text-red-600">
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} />
                      {formatCurrency(report.damage_cost)}
                    </div>
                  </td>
                  <td>
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className={`badge badge-sm ${getStatusBadge(report.status)} cursor-pointer`}>
                        {report.status}
                      </label>
                      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 z-50">
                        <li>
                          <button 
                            onClick={() => handleStatusChange(report.incident_id, 'Reported', report.status)}
                            className="text-orange-600 hover:bg-orange-50"
                          >
                            Reported
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => handleStatusChange(report.incident_id, 'Assessed', report.status)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            Assessed
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => handleStatusChange(report.incident_id, 'Repaired', report.status)}
                            className="text-purple-600 hover:bg-purple-50"
                          >
                            Repaired
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => handleStatusChange(report.incident_id, 'Closed', report.status)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            Closed
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
                        <MoreVertical className="w-4 h-4" />
                      </label>
                      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
                        <li>
                          <button 
                            onClick={() => handleViewReport(report)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </li>
                        <li>
                          <button className="text-green-600 hover:bg-green-50">
                            <Edit className="w-4 h-4" />
                            Edit Report
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => handleDelete(report.incident_id, report.incident_description)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Report
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

      {/* Damage Report Modal */}
      {showReportModal && (
        <DamageReportModal 
          report={selectedReport}
          onClose={() => setShowReportModal(false)}
          onReportUpdated={onRefetch}
        />
      )}
    </>
  )
}

export default DamageTable