// components/payments/DateRangeFilter.tsx
import React from 'react'
import { Calendar } from 'lucide-react'

interface DateRangeFilterProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onApply: () => void
  onClear: () => void
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar className="text-green-500" size={20} />
        Filter by Date Range
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="label">
            <span className="label-text">Start Date</span>
          </label>
          <input 
            type="date" 
            className="input input-bordered w-full"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">End Date</span>
          </label>
          <input 
            type="date" 
            className="input input-bordered w-full"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onApply} className="btn btn-primary flex-1">
            Apply Filter
          </button>
          <button onClick={onClear} className="btn btn-ghost">
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default DateRangeFilter