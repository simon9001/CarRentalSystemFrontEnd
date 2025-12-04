import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { MaintenanceApi } from '../../../features/Api/maintenanceApi'

interface CreateServiceRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onServiceCreated: () => void
}

const CreateServiceRecordModal: React.FC<CreateServiceRecordModalProps> = ({
  isOpen,
  onClose,
  onServiceCreated
}) => {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_type: '',
    service_date: '',
    next_service_date: '',
    service_cost: '',
    description: '',
    performed_by: '',
    status: 'Scheduled'
  })

  const [createService, { isLoading }] = MaintenanceApi.useCreateServiceRecordMutation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createService({
        vehicle_id: parseInt(formData.vehicle_id),
        service_type: formData.service_type,
        service_date: formData.service_date,
        service_cost: parseFloat(formData.service_cost),
        description: formData.description || undefined,
        next_service_date: formData.next_service_date || undefined,
        status: formData.status,
        performed_by: formData.performed_by || undefined
      }).unwrap()

      // Reset form and close modal
      setFormData({
        vehicle_id: '',
        service_type: '',
        service_date: '',
        next_service_date: '',
        service_cost: '',
        description: '',
        performed_by: '',
        status: 'Scheduled'
      })
      
      onServiceCreated()
    } catch (error) {
      console.error('Failed to create service record:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Create New Service Record</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Information */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Vehicle ID *</span>
              </label>
              <input 
                type="number"
                name="vehicle_id"
                className="input input-bordered"
                value={formData.vehicle_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Service Type *</span>
              </label>
              <select 
                name="service_type"
                className="select select-bordered"
                value={formData.service_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Service Type</option>
                <option value="Oil Change">Oil Change</option>
                <option value="Tire Rotation">Tire Rotation</option>
                <option value="Brake Service">Brake Service</option>
                <option value="Engine Repair">Engine Repair</option>
                <option value="Transmission">Transmission</option>
                <option value="Inspection">Inspection</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Service Date *</span>
              </label>
              <input 
                type="date"
                name="service_date"
                className="input input-bordered"
                value={formData.service_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Next Service Date</span>
              </label>
              <input 
                type="date"
                name="next_service_date"
                className="input input-bordered"
                value={formData.next_service_date}
                onChange={handleChange}
                min={formData.service_date}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Service Cost ($) *</span>
              </label>
              <input 
                type="number"
                step="0.01"
                min="0"
                name="service_cost"
                className="input input-bordered"
                value={formData.service_cost}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select 
                name="status"
                className="select select-bordered"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Performed By</span>
            </label>
            <input 
              type="text"
              name="performed_by"
              className="input input-bordered"
              value={formData.performed_by}
              onChange={handleChange}
              placeholder="Mechanic name or service center"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea 
              name="description"
              className="textarea textarea-bordered h-24"
              value={formData.description}
              onChange={handleChange}
              placeholder="Service details, notes, or observations..."
            />
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              Create Service Record
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateServiceRecordModal