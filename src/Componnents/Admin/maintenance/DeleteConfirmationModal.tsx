import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import {type  ServiceRecord } from '../../../features/Api/maintenanceApi'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  service: ServiceRecord
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  service
}) => {
  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-error">Delete Service Record</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={16} />
          </button>
        </div>

        <div className="alert alert-warning mb-4">
          <AlertTriangle size={24} />
          <div>
            <h4 className="font-bold">Warning: This action cannot be undone!</h4>
            <div className="text-sm">
              You are about to permanently delete this service record.
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold mb-2">Service Record Details:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Service ID:</strong> #{service.service_id}</p>
            <p><strong>Vehicle:</strong> {service.make} {service.model} ({service.registration_number})</p>
            <p><strong>Service Type:</strong> {service.service_type}</p>
            <p><strong>Service Date:</strong> {new Date(service.service_date).toLocaleDateString()}</p>
            <p><strong>Cost:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(service.service_cost)}</p>
          </div>
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-error">
            Delete Service Record
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal