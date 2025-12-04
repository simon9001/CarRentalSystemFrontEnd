// components/payments/PaymentFilters.tsx
import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface PaymentFiltersProps {
  showFilters: boolean
  filters: {
    status: string
    payment_method: string
    start_date: string
    end_date: string
  }
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
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
              <span className="label-text">Payment Status</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
              <option value="Partially_Refunded">Partially Refunded</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Payment Method</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={filters.payment_method}
              onChange={(e) => onFilterChange('payment_method', e.target.value)}
            >
              <option value="">All Methods</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
            </select>
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

export default PaymentFilters