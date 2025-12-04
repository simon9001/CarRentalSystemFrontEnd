// components/settings/SettingsSectionCard.tsx
import React from 'react'

interface SettingsSectionCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

const SettingsSectionCard: React.FC<SettingsSectionCardProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export default SettingsSectionCard