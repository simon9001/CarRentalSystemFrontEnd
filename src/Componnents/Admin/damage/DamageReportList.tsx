// components/damage/DamageReportList.tsx
import React, { useState } from 'react'
import { Search, Filter, Eye, Edit, Trash2, MoreVertical } from 'lucide-react'
import { DamageApi } from '../../../features/Api/DamageApi'
import DamageFilters from './DamageFilters'
import DamageTable from './DamageTable'

const DamageReportList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    vehicle_id: '',
    customer_id: '',
    booking_id: '',
    start_date: '',
    end_date: '',
    min_cost: '',
    max_cost: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: reportsResponse, isLoading, error, refetch } = DamageApi.useGetAllDamageReportsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    ...filters
  })

  const damageReports = reportsResponse?.data || []
  const totalPages = reportsResponse?.pagination?.totalPages || 1
  const totalItems = reportsResponse?.pagination?.total || 0

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      vehicle_id: '',
      customer_id: '',
      booking_id: '',
      start_date: '',
      end_date: '',
      min_cost: '',
      max_cost: ''
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-orange-600"></span>
        <span className="ml-3 text-gray-600">Loading damage reports...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 mb-3 text-4xl">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h3>
        <p className="text-red-600">Unable to fetch damage reports. Please try again later.</p>
      </div>
    )
  }

  return (
    <>
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search incident descriptions, IDs, registration numbers..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={handleSearch}
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
            </button>
          </div>
        </div>
      </div>

      <DamageFilters 
        showFilters={showFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <DamageTable 
        reports={damageReports}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onRefetch={refetch}
      />
    </>
  )
}

export default DamageReportList