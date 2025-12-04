import React from 'react'
import { BarChart3, TrendingUp, Car, Calendar } from 'lucide-react'
import { MaintenanceApi } from '../../../features/Api/maintenanceApi'

const MaintenanceAnalytics: React.FC = () => {
  const { data: costByVehicle, isLoading: costLoading } = MaintenanceApi.useGetMaintenanceCostByVehicleQuery()
  const { data: services } = MaintenanceApi.useGetAllServiceRecordsQuery({})

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Mock chart data - in a real app, you would use a charting library
  const monthlyCostData = [
    { month: 'Jan', cost: 4500 },
    { month: 'Feb', cost: 5200 },
    { month: 'Mar', cost: 4800 },
    { month: 'Apr', cost: 6100 },
    { month: 'May', cost: 5500 },
    { month: 'Jun', cost: 5900 },
  ]

  const serviceTypeDistribution = [
    { type: 'Oil Change', count: 45, color: 'bg-primary' },
    { type: 'Tire Rotation', count: 32, color: 'bg-secondary' },
    { type: 'Brake Service', count: 28, color: 'bg-accent' },
    { type: 'Engine Repair', count: 15, color: 'bg-warning' },
    { type: 'Inspection', count: 40, color: 'bg-success' },
    { type: 'Other', count: 12, color: 'bg-ghost' },
  ]

  if (costLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-orange-600"></span>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Cost Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={20} />
            Monthly Maintenance Cost
          </h3>
          <div className="space-y-3">
            {monthlyCostData.map((item, index) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{item.month}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${(item.cost / 7000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-20 text-right">
                    {formatCurrency(item.cost)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Service Type Distribution</h3>
          <div className="space-y-3">
            {serviceTypeDistribution.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{item.type}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${item.color} h-3 rounded-full`}
                      style={{ width: `${(item.count / 172) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost by Vehicle */}
      {costByVehicle && costByVehicle.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Car className="text-green-500" size={20} />
            Maintenance Cost by Vehicle
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th>Vehicle</th>
                  <th>Registration</th>
                  <th>Service Count</th>
                  <th>Total Cost</th>
                  <th>Average Cost</th>
                </tr>
              </thead>
              <tbody>
                {costByVehicle.slice(0, 10).map((vehicle) => (
                  <tr key={vehicle.vehicle_id}>
                    <td>
                      <div className="font-medium">
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </div>
                    </td>
                    <td>{vehicle.registration_number}</td>
                    <td>{vehicle.service_count}</td>
                    <td className="font-semibold text-green-600">
                      {formatCurrency(vehicle.total_maintenance_cost)}
                    </td>
                    <td className="text-gray-600">
                      {formatCurrency(vehicle.average_service_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent High-Cost Services */}
      {services && services.data && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent High-Cost Services</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th>Service ID</th>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Date</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {services.data
                  .filter(service => service.service_cost > 500)
                  .sort((a, b) => b.service_cost - a.service_cost)
                  .slice(0, 10)
                  .map((service) => (
                    <tr key={service.service_id}>
                      <td className="font-mono">#{service.service_id}</td>
                      <td>
                        {service.make} {service.model}
                      </td>
                      <td>{service.service_type}</td>
                      <td>{new Date(service.service_date).toLocaleDateString()}</td>
                      <td className="font-semibold text-red-600">
                        {formatCurrency(service.service_cost)}
                      </td>
                      <td>
                        <span className={`badge ${
                          service.status === 'Completed' ? 'badge-success' :
                          service.status === 'In Progress' ? 'badge-info' :
                          service.status === 'Scheduled' ? 'badge-warning' : 'badge-error'
                        }`}>
                          {service.status}
                        </span>
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

export default MaintenanceAnalytics