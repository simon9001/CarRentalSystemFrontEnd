// components/payments/PaymentStatusBadge.tsx
import React from 'react'
import { CheckCircle, Clock, XCircle, RefreshCw, AlertCircle } from 'lucide-react'

interface PaymentStatusBadgeProps {
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Partially_Refunded'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true 
}) => {
  const statusConfig = {
    'Pending': {
      icon: Clock,
      color: 'badge-warning',
      text: 'Pending'
    },
    'Completed': {
      icon: CheckCircle,
      color: 'badge-success',
      text: 'Completed'
    },
    'Failed': {
      icon: XCircle,
      color: 'badge-error',
      text: 'Failed'
    },
    'Refunded': {
      icon: RefreshCw,
      color: 'badge-secondary',
      text: 'Refunded'
    },
    'Partially_Refunded': {
      icon: AlertCircle,
      color: 'badge-info',
      text: 'Partially Refunded'
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

export default PaymentStatusBadge