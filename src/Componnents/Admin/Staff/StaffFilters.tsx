// StaffFilters.tsx
import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { staffApi } from '../../../features/Api/staffApi'

interface StaffFiltersProps {
  showFilters: boolean
  filters: {
    branch: string
    job_title: string
    department: string
    employment_type: string
    status: string
  }
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
}

const StaffFilters: React.FC<StaffFiltersProps> = ({
  showFilters,
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const { data: filtersData } = staffApi.useGetStaffFiltersQuery()
  const availableFilters = filtersData?.data || {}

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <button
          onClick={() => onFilterChange('toggle', '')} // Parent component should handle toggle
          className="btn btn-ghost btn-sm"
        >
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Branch</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={filters.branch}
              onChange={(e) => onFilterChange('branch', e.target.value)}
            >
              <option value="">All Branches</option>
              {availableFilters.branches?.map((branch: string) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Job Title</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={filters.job_title}
              onChange={(e) => onFilterChange('job_title', e.target.value)}
            >
              <option value="">All Job Titles</option>
              {availableFilters.job_titles?.map((title: string) => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Department</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={filters.department}
              onChange={(e) => onFilterChange('department', e.target.value)}
            >
              <option value="">All Departments</option>
              {availableFilters.departments?.map((dept: string) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Employment Type</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={filters.employment_type}
              onChange={(e) => onFilterChange('employment_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-5 flex justify-end gap-2">
            <button onClick={onClearFilters} className="btn btn-outline btn-sm">
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffFilters