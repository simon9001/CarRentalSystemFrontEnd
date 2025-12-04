// StaffOverviewCards.tsx
import React from 'react'
import { Users, Briefcase, Building, MapPin } from 'lucide-react'

interface OverviewCardsProps {
  overview: {
    active_staff?: number
    full_time?: number
    total_departments?: number
    active_branches?: number
    // Add other possible properties
    total_staff?: number
    terminated_staff?: number
    avg_salary?: number
    [key: string]: any // Allow for additional properties
  }
}

const StaffOverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Active Staff</p>
            <p className="text-2xl font-bold text-gray-900">{overview.active_staff || 0}</p>
          </div>
          <Users className="text-blue-500" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Full-Time Staff</p>
            <p className="text-2xl font-bold text-gray-900">{overview.full_time || 0}</p>
          </div>
          <Briefcase className="text-green-500" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Departments</p>
            <p className="text-2xl font-bold text-gray-900">{overview.total_departments || 0}</p>
          </div>
          <Building className="text-purple-500" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Branches</p>
            <p className="text-2xl font-bold text-gray-900">{overview.active_branches || 0}</p>
          </div>
          <MapPin className="text-orange-500" size={24} />
        </div>
      </div>
    </div>
  )
}

export default StaffOverviewCards