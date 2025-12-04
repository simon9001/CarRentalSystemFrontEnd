// pages/admin/settings/PaymentSettings.tsx
import React, { useState } from 'react'
import { CreditCard, Key, Globe, Clock, FileDigit, Eye, EyeOff } from 'lucide-react'
import { useGetPaymentSettingsQuery, useUpdatePaymentSettingsMutation } from '../../../features/Api/settingsApi'
import SettingsSectionCard from './SettingsSectionCard'
import SaveButton from './SaveButton'
import PaymentToggleList from './PaymentToggleList'

const PaymentSettings: React.FC = () => {
  const { data: settings, isLoading } = useGetPaymentSettingsQuery()
  const [updateSettings, { isLoading: isUpdating }] = useUpdatePaymentSettingsMutation()

  const [formData, setFormData] = useState({
    daraja_consumer_key: settings?.daraja_consumer_key || '',
    daraja_consumer_secret: settings?.daraja_consumer_secret || '',
    daraja_shortcode: settings?.daraja_shortcode || '',
    daraja_callback_url: settings?.daraja_callback_url || '',
    stripe_public_key: settings?.stripe_public_key || '',
    stripe_secret_key: settings?.stripe_secret_key || '',
    enabled_payment_methods: settings?.enabled_payment_methods || ['mpesa', 'card'],
    default_currency: settings?.default_currency || 'KES',
    transaction_timeout: settings?.transaction_timeout || 300,
    invoice_start_number: settings?.invoice_start_number || 1000,
  })

  const [showSecrets, setShowSecrets] = useState({
    daraja_secret: false,
    stripe_secret: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSettings(formData).unwrap()
    } catch (error) {
      console.error('Failed to update payment settings:', error)
    }
  }

  const toggleSecret = (key: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const currencies = [
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-3 text-gray-600">Loading payment settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Payment & Billing Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* M-Pesa Daraja API */}
        <SettingsSectionCard
          title="M-Pesa Daraja API"
          description="Configure M-Pesa payment integration"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Key size={16} />
                  Consumer Key
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.daraja_consumer_key}
                onChange={(e) => setFormData({ ...formData, daraja_consumer_key: e.target.value })}
                placeholder="Your Daraja consumer key"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Key size={16} />
                  Consumer Secret
                </span>
              </label>
              <div className="relative">
                <input
                  type={showSecrets.daraja_secret ? "text" : "password"}
                  className="input input-bordered w-full pr-12"
                  value={formData.daraja_consumer_secret}
                  onChange={(e) => setFormData({ ...formData, daraja_consumer_secret: e.target.value })}
                  placeholder="Your Daraja consumer secret"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('daraja_secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets.daraja_secret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Shortcode</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.daraja_shortcode}
                onChange={(e) => setFormData({ ...formData, daraja_shortcode: e.target.value })}
                placeholder="Business shortcode"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Callback URL</span>
              </label>
              <input
                type="url"
                className="input input-bordered w-full"
                value={formData.daraja_callback_url}
                onChange={(e) => setFormData({ ...formData, daraja_callback_url: e.target.value })}
                placeholder="https://yourdomain.com/callback"
              />
            </div>
          </div>
        </SettingsSectionCard>

        {/* Stripe Configuration */}
        <SettingsSectionCard
          title="Stripe Payment Gateway"
          description="Configure credit/debit card payments"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text">Public Key</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.stripe_public_key}
                onChange={(e) => setFormData({ ...formData, stripe_public_key: e.target.value })}
                placeholder="pk_live_..."
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Secret Key</span>
              </label>
              <div className="relative">
                <input
                  type={showSecrets.stripe_secret ? "text" : "password"}
                  className="input input-bordered w-full pr-12"
                  value={formData.stripe_secret_key}
                  onChange={(e) => setFormData({ ...formData, stripe_secret_key: e.target.value })}
                  placeholder="sk_live_..."
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('stripe_secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets.stripe_secret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </SettingsSectionCard>

        {/* Payment Methods */}
        <PaymentToggleList
          enabledMethods={formData.enabled_payment_methods}
          onChange={(methods) => setFormData({ ...formData, enabled_payment_methods: methods })}
        />

        {/* General Settings */}
        <SettingsSectionCard
          title="General Payment Settings"
          description="Configure billing and transaction preferences"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Globe size={16} />
                  Default Currency
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.default_currency}
                onChange={(e) => setFormData({ ...formData, default_currency: e.target.value })}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Clock size={16} />
                  Transaction Timeout (seconds)
                </span>
              </label>
              <input
                type="number"
                min="30"
                max="3600"
                className="input input-bordered w-full"
                value={formData.transaction_timeout}
                onChange={(e) => setFormData({ ...formData, transaction_timeout: parseInt(e.target.value) })}
              />
              <div className="text-xs text-gray-500 mt-1">
                Time before pending transactions expire
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <FileDigit size={16} />
                  Invoice Start Number
                </span>
              </label>
              <input
                type="number"
                min="1"
                className="input input-bordered w-full"
                value={formData.invoice_start_number}
                onChange={(e) => setFormData({ ...formData, invoice_start_number: parseInt(e.target.value) })}
              />
              <div className="text-xs text-gray-500 mt-1">
                Starting number for invoice sequence
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

export default PaymentSettings