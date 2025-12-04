// components/settings/APIKeyDisplay.tsx
import React, { useState } from 'react'
import { Key, Calendar, Eye, EyeOff, Copy, Trash2 } from 'lucide-react'
import type { ApiKey } from '../../../features/Api/settingsApi'

interface APIKeyDisplayProps {
  apiKey: ApiKey
  onRevoke: () => void
}

const APIKeyDisplay: React.FC<APIKeyDisplayProps> = ({ apiKey, onRevoke }) => {
  const [showKey, setShowKey] = useState(false)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never expires'
    return new Date(dateString).toLocaleDateString()
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.key)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '•'.repeat(24) + key.substring(key.length - 8)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Key size={20} className="text-primary" />
          </div>
          <div>
            <div className="font-semibold">{apiKey.name}</div>
            <div className="text-sm text-gray-600 flex items-center gap-4">
              <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Expires: {formatDate(apiKey.expires_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKey(!showKey)}
            className="btn btn-ghost btn-sm"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={copyToClipboard}
            className="btn btn-ghost btn-sm"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onRevoke}
            className="btn btn-ghost btn-sm text-error"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3 p-3 bg-gray-100 rounded-lg font-mono text-sm">
        {showKey ? apiKey.key : maskKey(apiKey.key)}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {apiKey.permissions.map((permission) => (
          <span key={permission} className="badge badge-outline badge-sm">
            {permission}
          </span>
        ))}
      </div>
    </div>
  )
}

export default APIKeyDisplay