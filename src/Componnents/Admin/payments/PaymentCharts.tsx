// components/payments/PaymentCharts.tsx
import React from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'

interface PaymentChartsProps {
  data?: any
}

const PaymentCharts: React.FC<PaymentChartsProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="text-green-500" size={20} />
        Payment Trends
      </h3>
      <div className="text-center py-12">
        <TrendingUp className="mx-auto text-gray-400 mb-3" size={48} />
        <p className="text-gray-500 mb-2">Payment charts and analytics</p>
        <p className="text-sm text-gray-400">
          Integrate with charts library like Recharts or Chart.js for visual analytics
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">$12,456</p>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">89%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentCharts