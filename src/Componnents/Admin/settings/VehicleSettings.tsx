// pages/admin/settings/VehicleSettings.tsx
import React, { useState } from 'react'
import { Car, Gauge, Calendar, Bell, MapPin, CheckCircle } from 'lucide-react'
import { useGetVehicleSettingsQuery, useUpdateVehicleSettingsMutation } from '../../../features/Api/settingsApi'
import SettingsSectionCard from './SettingsSectionCard'
import SaveButton from './SaveButton'

const VehicleSettings: React.FC = () => {
  const { data: settings, isLoading } = useGetVehicleSettingsQuery()
  const [updateSettings, { isLoading: isUpdating }] = useUpdateVehicleSettingsMutation()

  const [formData, setFormData] = useState({
    service_interval_km: settings?.service_interval_km || 10000,
    service_interval_months: settings?.service_interval_months || 6,
    reminder_threshold: settings?.reminder_threshold || 80,
    allowed_statuses: settings?.allowed_statuses || ['Available', 'Rented', 'Maintenance', 'Cleaning'],
    branch_rental_limits: settings?.branch_rental_limits || {},
    vehicle_activation_rules: settings?.vehicle_activation_rules || {
      min_insurance_days: 30,
      require_inspection: true,
      require_documentation: true,
    },
  })

  const [newStatus, setNewStatus] = useState('')
  const [newBranchLimit, setNewBranchLimit] = useState({ branch: '', limit: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSettings(formData).unwrap()
    } catch (error) {
      console.error('Failed to update vehicle settings:', error)
    }
  }

  const addStatus = () => {
    if (newStatus && !formData.allowed_statuses.includes(newStatus)) {
      setFormData({
        ...formData,
        allowed_statuses: [...formData.allowed_statuses, newStatus]
      })
      setNewStatus('')
    }
  }

  const removeStatus = (status: string) => {
    setFormData({
      ...formData,
      allowed_statuses: formData.allowed_statuses.filter(s => s !== status)
    })
  }

  const addBranchLimit = () => {
    if (newBranchLimit.branch && newBranchLimit.limit) {
      setFormData({
        ...formData,
        branch_rental_limits: {
          ...formData.branch_rental_limits,
          [newBranchLimit.branch]: parseInt(newBranchLimit.limit)
        }
      })
      setNewBranchLimit({ branch: '', limit: '' })
    }
  }

  const removeBranchLimit = (branch: string) => {
    const updatedLimits = { ...formData.branch_rental_limits }
    delete updatedLimits[branch]
    setFormData({
      ...formData,
      branch_rental_limits: updatedLimits
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-3 text-gray-600">Loading vehicle settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Car className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Vehicle Management Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Maintenance Intervals */}
        <SettingsSectionCard
          title="Maintenance Intervals"
          description="Configure service schedules and reminders"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Gauge size={16} />
                  Service Interval (KM)
                </span>
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                className="input input-bordered w-full"
                value={formData.service_interval_km}
                onChange={(e) => setFormData({ ...formData, service_interval_km: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Calendar size={16} />
                  Service Interval (Months)
                </span>
              </label>
              <input
                type="number"
                min="1"
                max="24"
                className="input input-bordered w-full"
                value={formData.service_interval_months}
                onChange={(e) => setFormData({ ...formData, service_interval_months: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Bell size={16} />
                  Reminder Threshold (%)
                </span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                className="input input-bordered w-full"
                value={formData.reminder_threshold}
                onChange={(e) => setFormData({ ...formData, reminder_threshold: parseInt(e.target.value) })}
              />
              <div className="text-xs text-gray-500 mt-1">
                Send reminders when {formData.reminder_threshold}% of interval is reached
              </div>
            </div>
          </div>
        </SettingsSectionCard>

        {/* Vehicle Statuses */}
        <SettingsSectionCard
          title="Vehicle Status Management"
          description="Manage available vehicle status types"
        >
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                className="input input-bordered flex-1"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="Enter new status (e.g., Reserved)"
              />
              <button
                type="button"
                onClick={addStatus}
                className="btn btn-primary"
                disabled={!newStatus}
              >
                Add Status
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.allowed_statuses.map((status) => (
                <div key={status} className="badge badge-lg badge-outline gap-2">
                  {status}
                  <button
                    type="button"
                    onClick={() => removeStatus(status)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </SettingsSectionCard>

        {/* Branch Rental Limits */}
        <SettingsSectionCard
          title="Branch Rental Limits"
          description="Set maximum number of vehicles per branch location"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                className="input input-bordered"
                value={newBranchLimit.branch}
                onChange={(e) => setNewBranchLimit({ ...newBranchLimit, branch: e.target.value })}
                placeholder="Branch name"
              />
              <input
                type="number"
                min="1"
                className="input input-bordered"
                value={newBranchLimit.limit}
                onChange={(e) => setNewBranchLimit({ ...newBranchLimit, limit: e.target.value })}
                placeholder="Max vehicles"
              />
              <button
                type="button"
                onClick={addBranchLimit}
                className="btn btn-primary"
                disabled={!newBranchLimit.branch || !newBranchLimit.limit}
              >
                Add Limit
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(formData.branch_rental_limits).map(([branch, limit]) => (
                <div key={branch} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="font-medium">{branch}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Max: {limit} vehicles</span>
                    <button
                      type="button"
                      onClick={() => removeBranchLimit(branch)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SettingsSectionCard>

        {/* Vehicle Activation Rules */}
        <SettingsSectionCard
          title="Vehicle Activation Rules"
          description="Requirements for making vehicles available for rental"
        >
          <div className="space-y-4">
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.vehicle_activation_rules.require_inspection}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicle_activation_rules: {
                      ...formData.vehicle_activation_rules,
                      require_inspection: e.target.checked
                    }
                  })}
                />
                <span className="label-text flex items-center gap-2">
                  <CheckCircle size={16} />
                  Require safety inspection before activation
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.vehicle_activation_rules.require_documentation}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicle_activation_rules: {
                      ...formData.vehicle_activation_rules,
                      require_documentation: e.target.checked
                    }
                  })}
                />
                <span className="label-text">
                  Require complete documentation (registration, insurance)
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text">Minimum Insurance Days</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  className="input input-bordered w-full"
                  value={formData.vehicle_activation_rules.min_insurance_days}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicle_activation_rules: {
                      ...formData.vehicle_activation_rules,
                      min_insurance_days: parseInt(e.target.value)
                    }
                  })}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Minimum days of valid insurance required
                </div>
              </div>
            </div>
          </div>
        </SettingsSectionCard>

        <div className="flex justify-end">
          <SaveButton isLoading={isUpdating} />
        </div>
      </form>
    </div>
  )
}

export default VehicleSettings