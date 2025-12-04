// components/damage/StatusBadge.tsx
import React from 'react'
import { AlertTriangle, Clock, Wrench, CheckCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: 'Reported' | 'Assessed' | 'Repaired' | 'Closed'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true 
}) => {
  const statusConfig = {
    'Reported': {
      icon: AlertTriangle,
      color: 'badge-warning',
      text: 'Reported'
    },
    'Assessed': {
      icon: Clock,
      color: 'badge-info',
      text: 'Assessed'
    },
    'Repaired': {
      icon: Wrench,
      color: 'badge-secondary',
      text: 'Repaired'
    },
    'Closed': {
      icon: CheckCircle,
      color: 'badge-success',
      text: 'Closed'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg'
  }

  return (
    <span className={`badge ${config.color} ${sizeClasses[size]} gap-1`}>
      {showIcon && <Icon size={14} />}
      {config.text}
    </span>
  )
}

export default StatusBadge