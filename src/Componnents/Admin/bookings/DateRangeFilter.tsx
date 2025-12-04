// src/components/admin/bookings/DateRangeFilter.tsx
import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ dateRange, onDateRangeChange }) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({
      ...dateRange,
      start: e.target.value ? new Date(e.target.value) : null
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({
      ...dateRange,
      end: e.target.value ? new Date(e.target.value) : null
    });
  };

  const clearFilters = () => {
    onDateRangeChange({ start: null, end: null });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-gray-400" />
        <div className="form-control">
          <label className="label">
            <span className="label-text">From Date</span>
          </label>
          <input
            type="date"
            value={dateRange.start?.toISOString().split('T')[0] || ''}
            onChange={handleStartDateChange}
            className="input input-bordered"
          />
        </div>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">To Date</span>
        </label>
        <input
          type="date"
          value={dateRange.end?.toISOString().split('T')[0] || ''}
          onChange={handleEndDateChange}
          className="input input-bordered"
        />
      </div>
      
      <button
        onClick={clearFilters}
        className="btn btn-ghost btn-sm"
      >
        Clear
      </button>
    </div>
  );
};

export default DateRangeFilter;