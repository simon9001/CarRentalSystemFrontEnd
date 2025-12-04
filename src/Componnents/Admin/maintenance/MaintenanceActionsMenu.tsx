// components/maintenance/MaintenanceActionsMenu.tsx
import React, { useState } from 'react'
import { MoreVertical, Eye, Edit, Trash2, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { type ServiceRecord, MaintenanceApi } from '../../../features/Api/maintenanceApi'
import UpdateStatusModal from './UpdateStatusModal'
import UpdateCostModal from './UpdateCostModal'
import EditServiceModal from './EditServiceModal'
import DeleteConfirmationModal from './DeleteConfirmationModal'

interface MaintenanceActionsMenuProps {
  service: ServiceRecord
  onActionComplete: () => void
}

const MaintenanceActionsMenu: React.FC<MaintenanceActionsMenuProps> = ({ service, onActionComplete }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showCostModal, setShowCostModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [updateStatus] = MaintenanceApi.useUpdateServiceStatusMutation()
  const [updateCost] = MaintenanceApi.useUpdateServiceCostMutation()
  const [deleteService] = MaintenanceApi.useDeleteServiceRecordMutation()

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatus({
        service_id: service.service_id,
        status: newStatus
      }).unwrap()
      setShowStatusModal(false)
      onActionComplete()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleCostUpdate = async (newCost: number) => {
    try {
      await updateCost({
        service_id: service.service_id,
        service_cost: newCost
      }).unwrap()
      setShowCostModal(false)
      onActionComplete()
    } catch (error) {
      console.error('Failed to update cost:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteService(service.service_id).unwrap()
      setShowDeleteModal(false)
      onActionComplete()
    } catch (error) {
      console.error('Failed to delete service:', error)
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'Scheduled': ['In Progress', 'Completed', 'Cancelled'],
      'In Progress': ['Completed', 'Cancelled'],
      'Completed': ['Scheduled', 'In Progress'],
      'Overdue': ['In Progress', 'Completed', 'Cancelled'],
      'Cancelled': ['Scheduled', 'In Progress'],
    }
    return statusFlow[currentStatus as keyof typeof statusFlow] || []
  }

  return (
    <>
      <div className="dropdown dropdown-end">
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical size={16} />
        </button>
        
        {showMenu && (
          <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
            <li>
              <button onClick={() => setShowEditModal(true)}>
                <Eye size={16} />
                View Details
              </button>
            </li>
            <li>
              <button onClick={() => setShowStatusModal(true)}>
                <CheckCircle size={16} />
                Update Status
              </button>
            </li>
            <li>
              <button onClick={() => setShowEditModal(true)}>
                <Edit size={16} />
                Edit Service
              </button>
            </li>
            <li>
              <button onClick={() => setShowCostModal(true)}>
                <DollarSign size={16} />
                Update Cost
              </button>
            </li>
            <li>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="text-error"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </li>
          </ul>
        )}
      </div>

      {/* Modals */}
      <UpdateStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        currentStatus={service.status}
        availableStatuses={getNextStatus(service.status)}
        onStatusUpdate={handleStatusUpdate}
        serviceId={service.service_id}
      />

      <UpdateCostModal
        isOpen={showCostModal}
        onClose={() => setShowCostModal(false)}
        currentCost={service.service_cost}
        onCostUpdate={handleCostUpdate}
        serviceId={service.service_id}
      />

      <EditServiceModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        service={service}
        onServiceUpdated={onActionComplete}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        service={service}
      />
    </>
  )
}

export default MaintenanceActionsMenu