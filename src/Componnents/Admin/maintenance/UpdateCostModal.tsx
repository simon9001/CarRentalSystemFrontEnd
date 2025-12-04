import React, { useState } from 'react'
import { DollarSign, X } from 'lucide-react'

interface UpdateCostModalProps {
  isOpen: boolean
  onClose: () => void
  currentCost: number
  onCostUpdate: (newCost: number) => void
  serviceId: number
}

const UpdateCostModal: React.FC<UpdateCostModalProps> = ({
  isOpen,
  onClose,
  currentCost,
  onCostUpdate,
  serviceId
}) => {
  const [newCost, setNewCost] = useState(currentCost.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const costValue = parseFloat(newCost)
    if (!isNaN(costValue) && costValue >= 0) {
      onCostUpdate(costValue)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Update Service Cost</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={16} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Service ID: #{serviceId}</p>
          <p className="text-sm text-gray-600">
            Current Cost: <span className="font-semibold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currentCost)}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">New Cost</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="number"
                step="0.01"
                min="0"
                className="input input-bordered w-full pl-10"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Cost
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateCostModal