import React from 'react'

interface ServiceTypeBadgeProps {
  serviceType: string
  size?: 'sm' | 'md' | 'lg'
}

const ServiceTypeBadge: React.FC<ServiceTypeBadgeProps> = ({ serviceType, size = 'md' }) => {
  const getServiceTypeConfig = (type: string) => {
    const config = {
      'Oil Change': { color: 'badge-primary', icon: '🛢️' },
      'Tire Rotation': { color: 'badge-secondary', icon: '🌀' },
      'Brake Service': { color: 'badge-accent', icon: '🛑' },
      'Engine Repair': { color: 'badge-warning', icon: '⚙️' },
      'Transmission': { color: 'badge-info', icon: '🔧' },
      'Inspection': { color: 'badge-success', icon: '🔍' },
      'Other': { color: 'badge-ghost', icon: '🔩' },
    }

    return config[type as keyof typeof config] || { color: 'badge-ghost', icon: '🔧' }
  }

  const { color, icon } = getServiceTypeConfig(serviceType)
  const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : ''

  return (
    <span className={`badge ${color} ${sizeClass} gap-1`}>
      {icon} {serviceType}
    </span>
  )
}

export default ServiceTypeBadge