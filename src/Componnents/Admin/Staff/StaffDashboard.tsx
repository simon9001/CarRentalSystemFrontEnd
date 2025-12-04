// StaffDashboard.tsx
import React from 'react'
import { staffApi } from '../../../features/Api/staffApi'
import StaffOverviewCards from './StaffOverviewCards'
import StaffStatistics from './StaffStatistics'

const StaffDashboard: React.FC = () => {
  // Provide an empty object or appropriate argument
  const { data: overviewData, isLoading, error } = staffApi.useGetStaffOverviewQuery({})

  const staffOverview = overviewData?.data || {}

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-purple-600"></span>
        <span className="ml-3 text-gray-600">Loading dashboard data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 mb-3 text-4xl">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600">Unable to fetch dashboard data. Please try again later.</p>
      </div>
    )
  }

  return (
    <>
      <StaffOverviewCards overview={staffOverview} />
      <StaffStatistics overview={staffOverview} />
    </>
  )
}

export default StaffDashboard