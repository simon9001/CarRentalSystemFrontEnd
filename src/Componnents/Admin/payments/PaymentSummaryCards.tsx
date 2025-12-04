// components/payments/PaymentSummaryCards.tsx - Fixed version
import React from 'react'
import { CreditCard, CheckCircle, Clock, XCircle, RefreshCw, DollarSign } from 'lucide-react'

interface PaymentSummaryCardsProps {
  summary: {
    total_payments: number
    completed_payments: number
    pending_payments: number
    failed_payments: number
    refunded_payments: number
    total_revenue: number
    total_refunds: number
    net_revenue: number
  }
}

const PaymentSummaryCards: React.FC<PaymentSummaryCardsProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Payments */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_payments}</p>
          </div>
          <CreditCard className="text-blue-500" size={24} />
        </div>
      </div>

      {/* Completed Payments */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{summary.completed_payments}</p>
          </div>
          <CheckCircle className="text-green-500" size={24} />
        </div>
      </div>

      {/* Pending Payments */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{summary.pending_payments}</p>
          </div>
          <Clock className="text-yellow-500" size={24} />
        </div>
      </div>

      {/* Net Revenue */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Net Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.net_revenue)}</p>
          </div>
          <DollarSign className="text-purple-500" size={24} />
        </div>
      </div>
    </div>
  )
}

export default PaymentSummaryCards