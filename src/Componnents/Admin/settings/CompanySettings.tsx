// pages/admin/settings/CompanySettings.tsx
import React, { useState } from 'react'
import { Building2, Mail, Phone, MapPin, Receipt } from 'lucide-react'
import { useGetCompanySettingsQuery, useUpdateCompanySettingsMutation } from '../../../features/Api/settingsApi'
import SettingsSectionCard from './SettingsSectionCard'
import SaveButton from './SaveButton'
import LogoUploader from './LogoUploader'
import ColorPicker from './ColorPicker'

const CompanySettings: React.FC = () => {
  const { data: settings, isLoading } = useGetCompanySettingsQuery()
  const [updateSettings, { isLoading: isUpdating }] = useUpdateCompanySettingsMutation()

  const [formData, setFormData] = useState({
    company_name: settings?.company_name || '',
    logo_url: settings?.logo_url || null,
    primary_color: settings?.primary_color || '#3B82F6',
    support_email: settings?.support_email || '',
    support_phone: settings?.support_phone || '',
    address: settings?.address || '',
    tax_rate: settings?.tax_rate || 0,
    vat_number: settings?.vat_number || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSettings(formData).unwrap()
      // Show success toast
    } catch (error) {
      console.error('Failed to update company settings:', error)
    }
  }

  const handleLogoChange = (file: File | null) => {
    // Handle logo upload logic here
    console.log('Logo changed:', file)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-3 text-gray-600">Loading company settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Company Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Identity */}
        <SettingsSectionCard
          title="Brand Identity"
          description="Configure your company's visual identity"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text">Company Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>

            <div>
              <ColorPicker
                value={formData.primary_color}
                onChange={(color) => setFormData({ ...formData, primary_color: color })}
                label="Primary Brand Color"
              />
            </div>

            <div className="lg:col-span-2">
              <LogoUploader
                currentLogo={formData.logo_url}
                onLogoChange={handleLogoChange}
              />
            </div>
          </div>
        </SettingsSectionCard>

        {/* Contact Information */}
        <SettingsSectionCard
          title="Contact Information"
          description="How customers can reach your company"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Mail size={16} />
                  Support Email
                </span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={formData.support_email}
                onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Phone size={16} />
                  Support Phone
                </span>
              </label>
              <input
                type="tel"
                className="input input-bordered w-full"
                value={formData.support_phone}
                onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <MapPin size={16} />
                  Physical Address
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
          </div>
        </SettingsSectionCard>

        {/* Tax Configuration */}
        <SettingsSectionCard
          title="Tax Configuration"
          description="Tax and VAT settings for billing"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Receipt size={16} />
                  Tax Rate (%)
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="input input-bordered w-full"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">VAT Number</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.vat_number}
                onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
              />
            </div>
          </div>
        </SettingsSectionCard>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button type="button" className="btn btn-ghost">
            Reset to Defaults
          </button>
          <SaveButton isLoading={isUpdating} />
        </div>
      </form>
    </div>
  )
}

export default CompanySettings