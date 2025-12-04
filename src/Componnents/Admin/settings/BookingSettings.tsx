// pages/admin/settings/BookingSettings.tsx
import React, { useState } from 'react'
import { Calendar, DollarSign, Shield, Clock, X, Plus } from 'lucide-react'
import { useGetBookingSettingsQuery, useUpdateBookingSettingsMutation } from '../../../features/Api/settingsApi'
import SettingsSectionCard from './SettingsSectionCard'
import SaveButton from './SaveButton'

interface AddOn {
  id: string
  name: string
  price: number
  description: string
}

const BookingSettings: React.FC = () => {
  const { data: settings, isLoading } = useGetBookingSettingsQuery()
  const [updateSettings, { isLoading: isUpdating }] = useUpdateBookingSettingsMutation()

  const [formData, setFormData] = useState({
    default_daily_rate: settings?.default_daily_rate || 0,
    weekend_multiplier: settings?.weekend_multiplier || 1,
    holiday_surcharge: settings?.holiday_surcharge || 0,
    min_driver_age: settings?.min_driver_age || 21,
    max_booking_days: settings?.max_booking_days || 30,
    insurance_fee: settings?.insurance_fee || 0,
    deposit_amount: settings?.deposit_amount || 0,
    late_return_penalty: settings?.late_return_penalty || 0,
    cancellation_policy: settings?.cancellation_policy || '',
    add_ons: settings?.add_ons || [],
  })

  const [newAddOn, setNewAddOn] = useState<Omit<AddOn, 'id'>>({
    name: '',
    price: 0,
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSettings(formData).unwrap()
    } catch (error) {
      console.error('Failed to update booking settings:', error)
    }
  }

  const addAddOn = () => {
    if (newAddOn.name && newAddOn.price >= 0) {
      const addOn: AddOn = {
        ...newAddOn,
        id: Date.now().toString()
      }
      setFormData({
        ...formData,
        add_ons: [...formData.add_ons, addOn]
      })
      setNewAddOn({ name: '', price: 0, description: '' })
    }
  }

  const removeAddOn = (id: string) => {
    setFormData({
      ...formData,
      add_ons: formData.add_ons.filter(addOn => addOn.id !== id)
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-3 text-gray-600">Loading booking settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Booking & Pricing Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pricing Configuration */}
        <SettingsSectionCard
          title="Pricing Configuration"
          description="Base rates and multipliers"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="label">
                <span className="label-text">Default Daily Rate</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input input-bordered w-full pl-10"
                  value={formData.default_daily_rate}
                  onChange={(e) => setFormData({ ...formData, default_daily_rate: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Weekend Multiplier</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">×</span>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  className="input input-bordered w-full pl-10"
                  value={formData.weekend_multiplier}
                  onChange={(e) => setFormData({ ...formData, weekend_multiplier: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Holiday Surcharge %</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="input input-bordered w-full pl-10"
                  value={formData.holiday_surcharge}
                  onChange={(e) => setFormData({ ...formData, holiday_surcharge: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </SettingsSectionCard>

        {/* Booking Rules */}
        <SettingsSectionCard
          title="Booking Rules"
          description="Configure booking constraints and policies"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text">Minimum Driver Age</span>
              </label>
              <input
                type="number"
                min="18"
                max="100"
                className="input input-bordered w-full"
                value={formData.min_driver_age}
                onChange={(e) => setFormData({ ...formData, min_driver_age: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Max Booking Days</span>
              </label>
              <input
                type="number"
                min="1"
                max="365"
                className="input input-bordered w-full"
                value={formData.max_booking_days}
                onChange={(e) => setFormData({ ...formData, max_booking_days: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Shield size={16} />
                  Insurance Fee
                </span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input input-bordered w-full pl-10"
                  value={formData.insurance_fee}
                  onChange={(e) => setFormData({ ...formData, insurance_fee: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Deposit Amount</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input input-bordered w-full pl-10"
                  value={formData.deposit_amount}
                  onChange={(e) => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Clock size={16} />
                  Late Return Penalty/Hour
                </span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input input-bordered w-full pl-10"
                  value={formData.late_return_penalty}
                  onChange={(e) => setFormData({ ...formData, late_return_penalty: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </SettingsSectionCard>

        {/* Cancellation Policy */}
        <SettingsSectionCard
          title="Cancellation Policy"
          description="Terms and conditions for booking cancellations"
        >
          <textarea
            className="textarea textarea-bordered w-full h-32"
            value={formData.cancellation_policy}
            onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
            placeholder="Enter your cancellation policy terms..."
          />
        </SettingsSectionCard>

        {/* Additional Add-ons */}
        <SettingsSectionCard
          title="Additional Services & Add-ons"
          description="Extra services customers can purchase"
        >
          <div className="space-y-4">
            {/* Add New Add-on */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="label">
                  <span className="label-text">Service Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={newAddOn.name}
                  onChange={(e) => setNewAddOn({ ...newAddOn, name: e.target.value })}
                  placeholder="GPS Navigation"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Price</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input input-bordered w-full pl-10"
                    value={newAddOn.price}
                    onChange={(e) => setNewAddOn({ ...newAddOn, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addAddOn}
                  className="btn btn-primary w-full"
                  disabled={!newAddOn.name || newAddOn.price < 0}
                >
                  <Plus size={16} />
                  Add Service
                </button>
              </div>
            </div>

            {/* Existing Add-ons */}
            <div className="space-y-2">
              {formData.add_ons.map((addOn) => (
                <div key={addOn.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{addOn.name}</div>
                    <div className="text-sm text-gray-600">{addOn.description}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">
                      ${addOn.price.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAddOn(addOn.id)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
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

export default BookingSettings