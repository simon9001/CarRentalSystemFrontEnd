// components/payments/PaymentMethodBadge.tsx
import React from 'react'
import { Smartphone, CreditCard, DollarSign, Building } from 'lucide-react'

interface PaymentMethodBadgeProps {
  method: 'Mpesa' | 'Card' | 'Cash' | 'Bank Transfer' | string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({ 
  method, 
  size = 'md', 
  showIcon = true,
  className = ''
}) => {
  const methodConfig = {
    'Mpesa': {
      icon: Smartphone,
      color: 'bg-green-100 text-green-800 border-green-200',
      text: 'Mpesa'
    },
    'Card': {
      icon: CreditCard,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      text: 'Card'
    },
    'Cash': {
      icon: DollarSign,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      text: 'Cash'
    },
    'Bank Transfer': {
      icon: Building,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      text: 'Bank Transfer'
    }
  }

  // Fallback for unknown methods
  const config = methodConfig[method as keyof typeof methodConfig] || {
    icon: CreditCard,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    text: method
  }
  
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border 
      ${config.color} ${sizeClasses[size]} ${className}
    `}>
      {showIcon && <Icon size={iconSizes[size]} className="mr-1.5" />}
      {config.text}
    </span>
  )
}

// Alternative version using DaisyUI classes if you're using DaisyUI
export const PaymentMethodBadgeDaisyUI: React.FC<PaymentMethodBadgeProps> = ({ 
  method, 
  size = 'md', 
  showIcon = true 
}) => {
  const methodConfig = {
    'Mpesa': {
      icon: Smartphone,
      color: 'badge-success',
      text: 'Mpesa'
    },
    'Card': {
      icon: CreditCard,
      color: 'badge-primary',
      text: 'Card'
    },
    'Cash': {
      icon: DollarSign,
      color: 'badge-warning',
      text: 'Cash'
    },
    'Bank Transfer': {
      icon: Building,
      color: 'badge-secondary',
      text: 'Bank Transfer'
    }
  }

  const config = methodConfig[method as keyof typeof methodConfig] || {
    icon: CreditCard,
    color: 'badge-outline',
    text: method
  }
  
  const Icon = config.icon

  const sizeClasses = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg'
  }

  return (
    <span className={`badge ${config.color} ${sizeClasses[size]} gap-1.5`}>
      {showIcon && <Icon size={14} />}
      {config.text}
    </span>
  )
}

export default PaymentMethodBadge