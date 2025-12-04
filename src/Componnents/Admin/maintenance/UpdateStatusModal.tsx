import React, { useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface UpdateStatusModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: string
  availableStatuses: string[]
  onStatusUpdate: (newStatus: string) => void
  serviceId: number
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  availableStatuses,
  onStatusUpdate,
  serviceId
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onStatusUpdate(selectedStatus)
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Update Service Status</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={16} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Service ID: #{serviceId}</p>
          <p className="text-sm text-gray-600">Current Status: <span className="badge badge-warning">{currentStatus}</span></p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">New Status</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              required
            >
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={16} className="mr-2" />
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateStatusModal