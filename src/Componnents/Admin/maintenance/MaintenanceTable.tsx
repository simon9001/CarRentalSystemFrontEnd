import React from 'react'
import { Edit, Trash2, MoreVertical, Eye } from 'lucide-react'
import {type  ServiceRecord } from '../../../features/Api/maintenanceApi'
import ServiceStatusBadge from './ServiceStatusBadge'
import MaintenanceActionsMenu from './MaintenanceActionsMenu'

interface MaintenanceTableProps {
  services: ServiceRecord[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  onRefetch: () => void
}

const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  services,
  currentPage,
  itemsPerPage,
  totalPages,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  onRefetch,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Table Header with Stats */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Service Records</h3>
            <p className="text-sm text-gray-600">
              Showing {startIndex}-{endIndex} of {totalItems} records
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Items per page:</span>
              </label>
              <select 
                className="select select-bordered select-sm"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-sm font-semibold text-gray-700">Service ID</th>
              <th className="text-sm font-semibold text-gray-700">Vehicle</th>
              <th className="text-sm font-semibold text-gray-700">Service Type</th>
              <th className="text-sm font-semibold text-gray-700">Service Date</th>
              <th className="text-sm font-semibold text-gray-700">Next Service</th>
              <th className="text-sm font-semibold text-gray-700">Cost</th>
              <th className="text-sm font-semibold text-gray-700">Status</th>
              <th className="text-sm font-semibold text-gray-700">Performed By</th>
              <th className="text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.service_id} className="hover:bg-gray-50">
                <td className="font-mono text-sm">#{service.service_id}</td>
                <td>
                  <div>
                    <div className="font-medium text-gray-900">
                      {service.make} {service.model}
                    </div>
                    <div className="text-sm text-gray-500">
                      {service.registration_number}
                    </div>
                  </div>
                </td>
                <td>
                  <ServiceTypeBadge serviceType={service.service_type} />
                </td>
                <td>
                  <div className="text-sm text-gray-900">
                    {formatDate(service.service_date)}
                  </div>
                </td>
                <td>
                  {service.next_service_date ? (
                    <div className="text-sm text-gray-900">
                      {formatDate(service.next_service_date)}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td>
                  <div className="font-medium text-gray-900">
                    {formatCurrency(service.service_cost)}
                  </div>
                </td>
                <td>
                  <ServiceStatusBadge status={service.status} />
                </td>
                <td>
                  {service.performed_by ? (
                    <div className="text-sm text-gray-700">{service.performed_by}</div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td>
                  <MaintenanceActionsMenu 
                    service={service}
                    onActionComplete={onRefetch}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="join-item btn btn-sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceTable