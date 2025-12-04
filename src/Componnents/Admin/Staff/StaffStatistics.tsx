// StaffStatistics.tsx
import React from 'react'
import { Users, BadgeCheck, UserX, DollarSign } from 'lucide-react'

interface StaffStatisticsProps {
  overview: {
    total_staff?: number
    active_staff?: number
    terminated_staff?: number
    avg_salary?: number
  }
}

const StaffStatistics: React.FC<StaffStatisticsProps> = ({ overview }) => {
  const formatSalary = (salary: number) => {
    return `$${salary?.toLocaleString() || '0'}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Staff Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Users className="mx-auto text-blue-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-blue-600">{overview.total_staff || 0}</p>
          <p className="text-sm text-gray-600">Total Staff</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <BadgeCheck className="mx-auto text-green-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-green-600">{overview.active_staff || 0}</p>
          <p className="text-sm text-gray-600">Active Staff</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <UserX className="mx-auto text-red-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-red-600">{overview.terminated_staff || 0}</p>
          <p className="text-sm text-gray-600">Terminated</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <DollarSign className="mx-auto text-purple-600 mb-2" size={24} />
          <p className="text-2xl font-bold text-purple-600">
            {overview.avg_salary ? formatSalary(overview.avg_salary) : '$0'}
          </p>
          <p className="text-sm text-gray-600">Avg Salary</p>
        </div>
      </div>
    </div>
  )
}

export default StaffStatistics