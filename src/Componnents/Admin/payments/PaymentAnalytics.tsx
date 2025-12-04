// components/payments/PaymentDashboard.tsx - Fixed version
import React from 'react'
import { CreditCard, CheckCircle, Clock, XCircle, RefreshCw, DollarSign, TrendingUp } from 'lucide-react'
import { PaymentApi } from '../../../features/Api/PaymentApi.ts'
import PaymentSummaryCards from './PaymentSummaryCards'

const PaymentDashboard: React.FC = () => {
  const { data: summary, isLoading, error } = PaymentApi.useGetPaymentSummaryQuery()

  // Fixed: Include all required properties in the fallback
  const dashboardData = summary || {
    total_payments: 0,
    completed_payments: 0,
    pending_payments: 0,
    failed_payments: 0,
    refunded_payments: 0,
    total_revenue: 0,
    total_refunds: 0,
    net_revenue: 0
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-green-600"></span>
        <span className="ml-3 text-gray-600">Loading payment analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <CreditCard className="mx-auto text-red-500 mb-3" size={48} />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600">Unable to fetch payment data. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <PaymentSummaryCards summary={dashboardData} />

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="text-green-500" size={20} />
            Revenue Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.total_revenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Refunds</span>
              <span className="text-xl font-semibold text-red-600">
                {formatCurrency(dashboardData.total_refunds)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-gray-800 font-semibold">Net Revenue</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(dashboardData.net_revenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Payment Status Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="mx-auto text-blue-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-blue-600">{dashboardData.completed_payments}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="mx-auto text-yellow-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-yellow-600">{dashboardData.pending_payments}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="mx-auto text-red-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-red-600">{dashboardData.failed_payments}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <RefreshCw className="mx-auto text-purple-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-purple-600">{dashboardData.refunded_payments}</p>
              <p className="text-sm text-gray-600">Refunded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-500" size={20} />
          Recent Payment Activity
        </h3>
        <div className="text-center py-8">
          <CreditCard className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500">Recent payment activity chart will be displayed here</p>
          <p className="text-sm text-gray-400">Integration with charts library required</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentDashboard