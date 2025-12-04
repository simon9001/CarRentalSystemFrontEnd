// components/payments/PaymentEmptyState.tsx
import React from 'react'
import { CreditCard, Search, Filter } from 'lucide-react'

interface PaymentEmptyStateProps {
  type?: 'no-payments' | 'no-results' | 'error'
  onClearFilters?: () => void
  onRetry?: () => void
}

const PaymentEmptyState: React.FC<PaymentEmptyStateProps> = ({ 
  type = 'no-payments', 
  onClearFilters,
  onRetry 
}) => {
  const getContent = () => {
    switch (type) {
      case 'no-payments':
        return {
          icon: CreditCard,
          title: 'No Payments Yet',
          description: 'There are no payments in the system. Payments will appear here once they are processed.',
          action: null
        }
      case 'no-results':
        return {
          icon: Search,
          title: 'No Payments Found',
          description: 'No payments match your current search criteria. Try adjusting your filters.',
          action: {
            label: 'Clear Filters',
            onClick: onClearFilters
          }
        }
      case 'error':
        return {
          icon: CreditCard,
          title: 'Unable to Load Payments',
          description: 'There was an error loading the payment data. Please try again.',
          action: {
            label: 'Try Again',
            onClick: onRetry
          }
        }
      default:
        return {
          icon: CreditCard,
          title: 'No Payments',
          description: 'No payments available.',
          action: null
        }
    }
  }

  const content = getContent()
  const Icon = content.icon

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <Icon className="mx-auto mb-4 text-gray-400" size={48} />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{content.title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{content.description}</p>
      
      {content.action && (
        <button 
          onClick={content.action.onClick}
          className="btn btn-primary"
        >
          {content.action.label}
        </button>
      )}
    </div>
  )
}

export default PaymentEmptyState