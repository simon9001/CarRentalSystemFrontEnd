// components/damage/DamageDashboard.tsx
import React from 'react'
import { AlertTriangle, CheckCircle, Clock, DollarSign, TrendingUp, Car } from 'lucide-react'
import { DamageApi } from '../../../features/Api/DamageApi'

const DamageDashboard: React.FC = () => {
  const { data: summary, isLoading, error } = DamageApi.useGetDamageReportSummaryQuery()
  const { data: unresolvedReports } = DamageApi.useGetUnresolvedDamageReportsQuery()

  const dashboardData = summary || {
    total_incidents: 0,
    reported_incidents: 0,
    assessed_incidents: 0,
    repaired_incidents: 0,
    closed_incidents: 0,
    total_damage_cost: 0,
    average_damage_cost: 0,
    recovered_cost: 0
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
        <span className="loading loading-spinner loading-lg text-orange-600"></span>
        <span className="ml-3 text-gray-600">Loading damage analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="mx-auto text-red-500 mb-3" size={48} />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600">Unable to fetch damage report data. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.total_incidents}</p>
            </div>
            <AlertTriangle className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unresolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.total_incidents - dashboardData.closed_incidents}
              </p>
            </div>
            <Clock className="text-orange-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.closed_incidents}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.total_damage_cost)}</p>
            </div>
            <DollarSign className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Incidents by Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Reported
              </span>
              <span className="font-semibold">{dashboardData.reported_incidents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                Assessed
              </span>
              <span className="font-semibold">{dashboardData.assessed_incidents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                Repaired
              </span>
              <span className="font-semibold">{dashboardData.repaired_incidents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Closed
              </span>
              <span className="font-semibold">{dashboardData.closed_incidents}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign size={16} className="text-gray-500" />
                Total Damage Cost
              </span>
              <span className="font-semibold text-red-600">{formatCurrency(dashboardData.total_damage_cost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp size={16} className="text-gray-500" />
                Average Cost
              </span>
              <span className="font-semibold">{formatCurrency(dashboardData.average_damage_cost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle size={16} className="text-gray-500" />
                Recovered Cost
              </span>
              <span className="font-semibold text-green-600">{formatCurrency(dashboardData.recovered_cost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Unresolved Reports */}
      {unresolvedReports && unresolvedReports.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20} />
            Recent Unresolved Reports
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th>Incident ID</th>
                  <th>Vehicle</th>
                  <th>Customer</th>
                  <th>Damage Cost</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {unresolvedReports.slice(0, 5).map((report) => (
                  <tr key={report.incident_id}>
                    <td className="font-bold">#{report.incident_id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-gray-400" />
                        <span>{report.make} {report.model}</span>
                      </div>
                    </td>
                    <td>{report.customer_name}</td>
                    <td className="font-semibold text-red-600">{formatCurrency(report.damage_cost)}</td>
                    <td>
                      <span className={`badge badge-sm ${
                        report.status === 'Reported' ? 'badge-warning' :
                        report.status === 'Assessed' ? 'badge-info' :
                        report.status === 'Repaired' ? 'badge-secondary' : 'badge-success'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">
                      {new Date(report.date_recorded).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DamageDashboard