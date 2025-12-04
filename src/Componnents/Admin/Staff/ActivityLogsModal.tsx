// components/staff/ActivityLogsModal.tsx
import React, { useState } from 'react'
import { 
  X, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Activity,
  ChevronDown,
  ChevronUp,
  Download,
  Eye
} from 'lucide-react'
import { staffApi } from '../../../features/Api/staffApi'

interface ActivityLogsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ActivityLog {
  log_id: number
  staff_id: number
  username: string
  action: string
  table_name: string
  record_id: number
  old_values: string
  new_values: string
  ip_address: string
  user_agent: string
  created_at: string
}

const ActivityLogsModal: React.FC<ActivityLogsModalProps> = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [filters, setFilters] = useState({
    staff_id: '',
    action: '',
    start_date: '',
    end_date: '',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [expandedLogs, setExpandedLogs] = useState<number[]>([])

  const { data: logsResponse, isLoading, error } = staffApi.useGetActivityLogsQuery({
    page: currentPage,
    limit: itemsPerPage,
    ...filters
  })

  const activityLogs = logsResponse?.data || []
  const totalPages = logsResponse?.pagination?.totalPages || 1
  const totalItems = logsResponse?.pagination?.total || 0

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      staff_id: '',
      action: '',
      start_date: '',
      end_date: '',
      search: ''
    })
    setCurrentPage(1)
  }

  // Toggle log expansion
  const toggleLogExpansion = (logId: number) => {
    setExpandedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    )
  }

  // Format date
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format JSON values for display
  const formatJsonValues = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return jsonString || 'No data'
    }
  }

  // Get action badge color
  const getActionBadge = (action: string) => {
    const actionConfig: { [key: string]: string } = {
      'CREATE': 'badge-success',
      'UPDATE': 'badge-warning',
      'DELETE': 'badge-error',
      'LOGIN': 'badge-info',
      'LOGOUT': 'badge-info',
    }
    return actionConfig[action] || 'badge-neutral'
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="text-purple-600" size={24} />
            <h3 className="text-lg font-bold">Staff Activity Logs</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-circle">
            <X size={20} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search actions, table names, or usernames..."
                  className="input input-bordered w-full pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline"
              >
                <Filter size={16} />
                Filters
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button className="btn btn-outline">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="label">
                  <span className="label-text">Staff ID</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full"
                  placeholder="Enter Staff ID"
                  value={filters.staff_id}
                  onChange={(e) => handleFilterChange('staff_id', e.target.value)}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Action</span>
                </label>
                <select 
                  className="select select-bordered w-full"
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
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
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
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
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2">
                <button onClick={clearFilters} className="btn btn-outline btn-sm">
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg text-purple-600"></span>
            <span className="ml-3 text-gray-600">Loading activity logs...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-500 mb-3 text-4xl">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Activity Logs</h3>
            <p className="text-red-600">Unable to fetch activity logs. Please try again later.</p>
          </div>
        )}

        {/* Activity Logs Table */}
        {!isLoading && !error && (
          <div className="flex-1 overflow-auto">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left font-semibold text-gray-700">Timestamp</th>
                      <th className="text-left font-semibold text-gray-700">Staff</th>
                      <th className="text-left font-semibold text-gray-700">Action</th>
                      <th className="text-left font-semibold text-gray-700">Table</th>
                      <th className="text-left font-semibold text-gray-700">Record ID</th>
                      <th className="text-left font-semibold text-gray-700">IP Address</th>
                      <th className="text-center font-semibold text-gray-700">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log: ActivityLog) => (
                      <React.Fragment key={log.log_id}>
                        <tr className="hover:bg-gray-50">
                          <td className="text-sm text-gray-600">
                            {formatDateTime(log.created_at)}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-gray-400" />
                              <span className="font-medium">{log.username}</span>
                              <span className="text-xs text-gray-500">#{log.staff_id}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-sm ${getActionBadge(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="font-mono text-sm">
                            {log.table_name}
                          </td>
                          <td className="font-mono text-sm">
                            {log.record_id}
                          </td>
                          <td className="text-sm text-gray-600">
                            {log.ip_address}
                          </td>
                          <td className="text-center">
                            <button 
                              onClick={() => toggleLogExpansion(log.log_id)}
                              className="btn btn-ghost btn-xs"
                            >
                              <Eye size={14} />
                              {expandedLogs.includes(log.log_id) ? 'Hide' : 'View'}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Details */}
                        {expandedLogs.includes(log.log_id) && (
                          <tr>
                            <td colSpan={7} className="bg-gray-50 p-4">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                  <h5 className="font-semibold mb-2 text-sm">Old Values</h5>
                                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                    {formatJsonValues(log.old_values)}
                                  </pre>
                                </div>
                                <div>
                                  <h5 className="font-semibold mb-2 text-sm">New Values</h5>
                                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                    {formatJsonValues(log.new_values)}
                                  </pre>
                                </div>
                                {log.user_agent && (
                                  <div className="lg:col-span-2">
                                    <h5 className="font-semibold mb-2 text-sm">User Agent</h5>
                                    <p className="text-sm bg-gray-100 p-3 rounded break-all">
                                      {log.user_agent}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {activityLogs.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Activity className="mx-auto text-gray-400 mb-3" size={48} />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No Activity Logs Found</h4>
                  <p className="text-gray-500">No activity logs match your current filters.</p>
                </div>
              )}

              {/* Pagination */}
              {activityLogs.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <select 
                        className="select select-bordered select-sm"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      >
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                      <span className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                      </span>
                    </div>
                    
                    <div className="join">
                      <button 
                        className="join-item btn btn-sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        «
                      </button>
                      <button className="join-item btn btn-sm">Page {currentPage}</button>
                      <button 
                        className="join-item btn btn-sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        »
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityLogsModal