// components/maintenance/MaintenanceFilters.tsx
import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MaintenanceFiltersProps {
  showFilters: boolean
  filters: {
    status: string
    service_type: string
    vehicle_id: string
    start_date: string
    end_date: string
  }
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
}

const MaintenanceFilters: React.FC<MaintenanceFiltersProps> = ({
  showFilters,
  filters,
  onFilterChange,
  onClearFilters
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <button
          onClick={() => onFilterChange('toggle', '')}
          className="btn btn-ghost btn-sm"
        >
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Service Status</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Service Type</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={filters.service_type}
              onChange={(e) => onFilterChange('service_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Tire Rotation">Tire Rotation</option>
              <option value="Brake Service">Brake Service</option>
              <option value="Engine Repair">Engine Repair</option>
              <option value="Transmission">Transmission</option>
              <option value="Inspection">Inspection</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Vehicle ID</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full"
              placeholder="Enter Vehicle ID"
              value={filters.vehicle_id}
              onChange={(e) => onFilterChange('vehicle_id', e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Start Date</span>
            </label>
            <input 
              type="date" 
              className="input input-bordered w-full"
              value={filters.start_date}
              onChange={(e) => onFilterChange('start_date', e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">End Date</span>
            </label>
            <input 
              type="date" 
              className="input input-bordered w-full"
              value={filters.end_date}
              onChange={(e) => onFilterChange('end_date', e.target.value)}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2">
            <button onClick={onClearFilters} className="btn btn-outline btn-sm">
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceFilters