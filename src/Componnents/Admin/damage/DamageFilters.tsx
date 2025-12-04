// components/damage/DamageFilters.tsx
import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface DamageFiltersProps {
  showFilters: boolean
  filters: {
    status: string
    vehicle_id: string
    customer_id: string
    booking_id: string
    start_date: string
    end_date: string
    min_cost: string | number
    max_cost: string | number
  }
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
}

const DamageFilters: React.FC<DamageFiltersProps> = ({
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
              <span className="label-text">Status</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Reported">Reported</option>
              <option value="Assessed">Assessed</option>
              <option value="Repaired">Repaired</option>
              <option value="Closed">Closed</option>
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
              <span className="label-text">Customer ID</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full"
              placeholder="Enter Customer ID"
              value={filters.customer_id}
              onChange={(e) => onFilterChange('customer_id', e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Booking ID</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full"
              placeholder="Enter Booking ID"
              value={filters.booking_id}
              onChange={(e) => onFilterChange('booking_id', e.target.value)}
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

          <div>
            <label className="label">
              <span className="label-text">Min Cost ($)</span>
            </label>
            <input 
              type="number" 
              className="input input-bordered w-full"
              placeholder="0"
              min="0"
              step="0.01"
              value={filters.min_cost}
              onChange={(e) => onFilterChange('min_cost', e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Max Cost ($)</span>
            </label>
            <input 
              type="number" 
              className="input input-bordered w-full"
              placeholder="10000"
              min="0"
              step="0.01"
              value={filters.max_cost}
              onChange={(e) => onFilterChange('max_cost', e.target.value)}
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

export default DamageFilters