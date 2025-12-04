// components/maintenance/MaintenanceDashboard.tsx
import React from 'react'
import { Wrench, CheckCircle, Clock, AlertTriangle, TrendingUp, Car, Calendar } from 'lucide-react'
import { MaintenanceApi } from '../../../features/Api/maintenanceApi'
import MaintenanceSummaryCards from './MaintenanceSummaryCards'

const MaintenanceDashboard: React.FC = () => {
  const { data: summary, isLoading, error } = MaintenanceApi.useGetServiceSummaryQuery()
  const { data: upcomingServices } = MaintenanceApi.useGetUpcomingServicesQuery()
  const { data: overdueServices } = MaintenanceApi.useGetOverdueServicesQuery()

  const dashboardData = summary || {
    total_services: 0,
    completed_services: 0,
    scheduled_services: 0,
    in_progress_services: 0,
    overdue_services: 0,
    total_service_cost: 0,
    average_service_cost: 0
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
        <span className="ml-3 text-gray-600">Loading maintenance analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Wrench className="mx-auto text-red-500 mb-3" size={48} />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600">Unable to fetch maintenance data. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <MaintenanceSummaryCards summary={dashboardData} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-500" size={20} />
            Cost Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Service Cost</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.total_service_cost)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Service Cost</span>
              <span className="text-xl font-semibold text-blue-600">
                {formatCurrency(dashboardData.average_service_cost)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Service Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Completed
              </span>
              <span className="font-semibold">{dashboardData.completed_services}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-yellow-500" />
                Scheduled
              </span>
              <span className="font-semibold">{dashboardData.scheduled_services}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wrench size={16} className="text-blue-500" />
                In Progress
              </span>
              <span className="font-semibold">{dashboardData.in_progress_services}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                Overdue
              </span>
              <span className="font-semibold">{dashboardData.overdue_services}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="btn btn-outline w-full justify-start">
              <Car size={16} />
              View All Services
            </button>
            <button className="btn btn-warning w-full justify-start">
              <AlertTriangle size={16} />
              View Overdue ({dashboardData.overdue_services})
            </button>
            <button className="btn btn-info w-full justify-start">
              <Calendar size={16} />
              View Upcoming ({upcomingServices?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Services */}
      {upcomingServices && upcomingServices.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="text-blue-500" size={20} />
            Upcoming Services ({upcomingServices.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingServices.slice(0, 5).map((service) => (
                  <tr key={service.service_id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-gray-400" />
                        <span>{service.make} {service.model}</span>
                      </div>
                    </td>
                    <td>{service.service_type}</td>
                    <td className="text-sm text-gray-600">
                      {new Date(service.service_date).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge badge-sm ${
                        service.status === 'Scheduled' ? 'badge-warning' :
                        service.status === 'In Progress' ? 'badge-info' : 'badge-success'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-xs">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overdue Services */}
      {overdueServices && overdueServices.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Overdue Services ({overdueServices.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdueServices.slice(0, 5).map((service) => {
                  const dueDate = new Date(service.service_date)
                  const today = new Date()
                  const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <tr key={service.service_id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Car size={14} className="text-gray-400" />
                          <span>{service.make} {service.model}</span>
                        </div>
                      </td>
                      <td>{service.service_type}</td>
                      <td className="text-sm text-gray-600">
                        {dueDate.toLocaleDateString()}
                      </td>
                      <td>
                        <span className="badge badge-error badge-sm">
                          {daysOverdue} days
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-error btn-xs">Reschedule</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceDashboard