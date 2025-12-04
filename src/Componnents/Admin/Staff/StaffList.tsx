// StaffList.tsx
import React, { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { staffApi } from '../../../features/Api/staffApi'
import StaffFilters from './StaffFilters'
import StaffTable from './StaffTable'

const StaffList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    branch: '',
    job_title: '',
    department: '',
    employment_type: '',
    status: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: staffResponse, isLoading: staffLoading, error, refetch } = staffApi.useGetAllStaffQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    ...filters
  })

  const allStaff = staffResponse?.data || []
  const totalPages = staffResponse?.pagination?.totalPages || 1

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
      branch: '',
      job_title: '',
      department: '',
      employment_type: '',
      status: ''
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  if (staffLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-purple-600"></span>
        <span className="ml-3 text-gray-600">Loading staff data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 mb-3 text-4xl">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Staff</h3>
        <p className="text-red-600">Unable to fetch staff data. Please try again later.</p>
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
                placeholder="Search staff by name, email, or employee ID..."
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

      <StaffFilters 
        showFilters={showFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <StaffTable 
        staff={allStaff}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        totalItems={staffResponse?.pagination?.total || 0}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onRefetch={refetch}
      />
    </>
  )
}

export default StaffList