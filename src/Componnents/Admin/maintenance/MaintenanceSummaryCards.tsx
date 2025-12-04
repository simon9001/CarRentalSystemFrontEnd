// components/maintenance/MaintenanceSummaryCards.tsx
import React from 'react'
import { Wrench, CheckCircle, Clock, AlertTriangle, DollarSign } from 'lucide-react'

interface MaintenanceSummaryCardsProps {
  summary: {
    total_services: number
    completed_services: number
    scheduled_services: number
    in_progress_services: number
    overdue_services: number
    total_service_cost: number
    average_service_cost: number
  }
}

const MaintenanceSummaryCards: React.FC<MaintenanceSummaryCardsProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Services */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Services</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_services}</p>
          </div>
          <Wrench className="text-blue-500" size={24} />
        </div>
      </div>

      {/* Completed Services */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{summary.completed_services}</p>
          </div>
          <CheckCircle className="text-green-500" size={24} />
        </div>
      </div>

      {/* Overdue Services */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Overdue</p>
            <p className="text-2xl font-bold text-gray-900">{summary.overdue_services}</p>
          </div>
          <AlertTriangle className="text-red-500" size={24} />
        </div>
      </div>

      {/* Total Cost */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Cost</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_service_cost)}</p>
          </div>
          <DollarSign className="text-purple-500" size={24} />
        </div>
      </div>
    </div>
  )
}

export default MaintenanceSummaryCards