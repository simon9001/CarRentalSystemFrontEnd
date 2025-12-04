// components/damage/CreateDamageReportModal.tsx
import React, { useState } from 'react'
import { X, Car, User, Calendar, DollarSign, FileText, Upload } from 'lucide-react'
import { DamageApi } from '../../../features/Api/DamageApi'
import Swal from 'sweetalert2'

interface CreateDamageReportModalProps {
  isOpen: boolean
  onClose: () => void
  onReportCreated: () => void
}

const CreateDamageReportModal: React.FC<CreateDamageReportModalProps> = ({ 
  isOpen, 
  onClose, 
  onReportCreated 
}) => {
  const [newReport, setNewReport] = useState({
    booking_id: '',
    vehicle_id: '',
    customer_id: '',
    incident_description: '',
    damage_cost: '',
    photos: ''
  })

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [createDamageReport] = DamageApi.useCreateDamageReportMutation()

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setNewReport({
        booking_id: '',
        vehicle_id: '',
        customer_id: '',
        incident_description: '',
        damage_cost: '',
        photos: ''
      })
      setFormErrors({})
    }
  }, [isOpen])

  // Form validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!newReport.booking_id) errors.booking_id = 'Booking ID is required'
    if (!newReport.vehicle_id) errors.vehicle_id = 'Vehicle ID is required'
    if (!newReport.customer_id) errors.customer_id = 'Customer ID is required'
    if (!newReport.incident_description) errors.incident_description = 'Incident description is required'
    if (!newReport.damage_cost || Number(newReport.damage_cost) <= 0) errors.damage_cost = 'Valid damage cost is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setNewReport(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCreateReport = async () => {
    if (!validateForm()) {
      Swal.fire('Validation Error', 'Please fill in all required fields correctly.', 'warning')
      return
    }

    setIsSubmitting(true)

    try {
      const reportData = {
        ...newReport,
        booking_id: Number(newReport.booking_id),
        vehicle_id: Number(newReport.vehicle_id),
        customer_id: Number(newReport.customer_id),
        damage_cost: Number(newReport.damage_cost),
        status: 'Reported' as const
      }

      await createDamageReport(reportData).unwrap()
      
      Swal.fire({
        title: 'Success!',
        text: 'Damage report created successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })

      onReportCreated()
      onClose()
    } catch (error: any) {
      console.error('Failed to create damage report:', error)
      Swal.fire({
        title: 'Error!',
        text: error?.data?.message || 'Failed to create damage report. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Car className="text-orange-600" size={24} />
            <h3 className="text-lg font-bold">Create New Damage Report</h3>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-circle"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Booking ID <span className="text-red-500">*</span></span>
                  </label>
                  <input 
                    type="number" 
                    className={`input input-bordered w-full ${formErrors.booking_id ? 'input-error' : ''}`}
                    placeholder="Enter Booking ID"
                    value={newReport.booking_id}
                    onChange={(e) => handleInputChange('booking_id', e.target.value)}
                  />
                  {formErrors.booking_id && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.booking_id}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Vehicle ID <span className="text-red-500">*</span></span>
                  </label>
                  <input 
                    type="number" 
                    className={`input input-bordered w-full ${formErrors.vehicle_id ? 'input-error' : ''}`}
                    placeholder="Enter Vehicle ID"
                    value={newReport.vehicle_id}
                    onChange={(e) => handleInputChange('vehicle_id', e.target.value)}
                  />
                  {formErrors.vehicle_id && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.vehicle_id}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Customer ID <span className="text-red-500">*</span></span>
                  </label>
                  <input 
                    type="number" 
                    className={`input input-bordered w-full ${formErrors.customer_id ? 'input-error' : ''}`}
                    placeholder="Enter Customer ID"
                    value={newReport.customer_id}
                    onChange={(e) => handleInputChange('customer_id', e.target.value)}
                  />
                  {formErrors.customer_id && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.customer_id}</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <FileText size={18} />
                Incident Details
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Incident Description <span className="text-red-500">*</span></span>
                  </label>
                  <textarea 
                    className={`textarea textarea-bordered w-full h-32 ${formErrors.incident_description ? 'textarea-error' : ''}`}
                    placeholder="Describe the damage incident in detail..."
                    value={newReport.incident_description}
                    onChange={(e) => handleInputChange('incident_description', e.target.value)}
                  />
                  {formErrors.incident_description && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{formErrors.incident_description}</span>
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Damage Cost <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="number" 
                        className={`input input-bordered w-full pl-10 ${formErrors.damage_cost ? 'input-error' : ''}`}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={newReport.damage_cost}
                        onChange={(e) => handleInputChange('damage_cost', e.target.value)}
                      />
                    </div>
                    {formErrors.damage_cost && (
                      <label className="label">
                        <span className="label-text-alt text-red-500">{formErrors.damage_cost}</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Upload size={18} />
                Damage Photos
              </h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-gray-600 mb-2">Upload damage photos (optional)</p>
                <p className="text-sm text-gray-500">Supported formats: JPG, PNG, GIF</p>
                <input 
                  type="file" 
                  className="hidden" 
                  id="photo-upload"
                  multiple
                  accept="image/*"
                />
                <label htmlFor="photo-upload" className="btn btn-outline btn-sm mt-3">
                  Select Photos
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-action mt-6 border-t pt-4">
          <button 
            onClick={onClose} 
            className="btn btn-ghost"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateReport} 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating...
              </>
            ) : (
              'Create Damage Report'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateDamageReportModal