// components/damage/DamageAnalytics.tsx
import React from 'react'
import { Car, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { DamageApi } from '../../../features/Api/DamageApi'

const DamageAnalytics: React.FC = () => {
  const { data: costByVehicle, isLoading, error } = DamageApi.useGetDamageCostByVehicleQuery()

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
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h3>
        <p className="text-red-600">Unable to fetch damage cost data. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{costByVehicle?.length || 0}</p>
            </div>
            <Car className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Damage Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(costByVehicle?.reduce((sum, vehicle) => sum + vehicle.total_damage_cost, 0) || 0)}
              </p>
            </div>
            <DollarSign className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  costByVehicle?.reduce((sum, vehicle) => sum + vehicle.average_damage_cost, 0) / (costByVehicle?.length || 1) || 0
                )}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      {/* Damage Cost by Vehicle Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Car size={20} />
            Damage Cost by Vehicle
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left font-semibold text-gray-700">Vehicle</th>
                <th className="text-left font-semibold text-gray-700">Registration</th>
                <th className="text-left font-semibold text-gray-700">Incident Count</th>
                <th className="text-left font-semibold text-gray-700">Total Damage Cost</th>
                <th className="text-left font-semibold text-gray-700">Average Cost</th>
              </tr>
            </thead>
            <tbody>
              {costByVehicle?.map((vehicle) => (
                <tr key={vehicle.vehicle_id} className="hover:bg-gray-50">
                  <td>
                    <div className="font-medium">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </div>
                  </td>
                  <td className="font-mono text-sm">{vehicle.registration_number}</td>
                  <td>
                    <span className="badge badge-outline">{vehicle.incident_count} incidents</span>
                  </td>
                  <td className="font-bold text-red-600">
                    {formatCurrency(vehicle.total_damage_cost)}
                  </td>
                  <td className="text-gray-600">
                    {formatCurrency(vehicle.average_damage_cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {(!costByVehicle || costByVehicle.length === 0) && (
          <div className="text-center py-8">
            <Car className="mx-auto text-gray-400 mb-3" size={48} />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Damage Data</h4>
            <p className="text-gray-500">No damage cost data available for vehicles.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DamageAnalytics