import React, { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import {type  ServiceRecord, MaintenanceApi } from '../../../features/Api/maintenanceApi'

interface EditServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service: ServiceRecord
  onServiceUpdated: () => void
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({
  isOpen,
  onClose,
  service,
  onServiceUpdated
}) => {
  const [formData, setFormData] = useState({
    service_type: '',
    service_date: '',
    next_service_date: '',
    service_cost: '',
    description: '',
    performed_by: '',
    status: ''
  })

  const [updateService, { isLoading }] = MaintenanceApi.useUpdateServiceRecordMutation()

  useEffect(() => {
    if (service) {
      setFormData({
        service_type: service.service_type,
        service_date: service.service_date.split('T')[0],
        next_service_date: service.next_service_date ? service.next_service_date.split('T')[0] : '',
        service_cost: service.service_cost.toString(),
        description: service.description || '',
        performed_by: service.performed_by || '',
        status: service.status
      })
    }
  }, [service])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateService({
        service_id: service.service_id,
        updates: {
          service_type: formData.service_type,
          service_date: formData.service_date,
          service_cost: parseFloat(formData.service_cost),
          description: formData.description || undefined,
          next_service_date: formData.next_service_date || undefined,
          status: formData.status,
          performed_by: formData.performed_by || undefined
        }
      }).unwrap()

      onServiceUpdated()
      onClose()
    } catch (error) {
      console.error('Failed to update service record:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Edit Service Record</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={16} />
          </button>
        </div>

        {/* Service Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-2">Service Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Service ID:</strong> #{service.service_id}</div>
            <div><strong>Vehicle:</strong> {service.make} {service.model}</div>
            <div><strong>Registration:</strong> {service.registration_number}</div>
            <div><strong>VIN:</strong> {service.vin_number || 'N/A'}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <option value="Cancelled">Cancelled</option>
              </select>
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
                <Save size={16} className="mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditServiceModal