// components/maintenance/MaintenanceList.tsx
import React, { useState } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import { MaintenanceApi } from '../../../features/Api/maintenanceApi'
import MaintenanceFilters from './MaintenanceFilters'
import MaintenanceTable from './MaintenanceTable'

const MaintenanceList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    service_type: '',
    vehicle_id: '',
    start_date: '',
    end_date: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: servicesResponse, isLoading, error, refetch } = MaintenanceApi.useGetAllServiceRecordsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    ...filters
  })

  const serviceRecords = servicesResponse?.data || []
  const totalPages = servicesResponse?.pagination?.totalPages || 1
  const totalItems = servicesResponse?.pagination?.total || 0

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
      service_type: '',
      vehicle_id: '',
      start_date: '',
      end_date: ''
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  // Export to CSV
  const handleExportCSV = () => {
    // CSV export implementation would go here
    console.log('Exporting service records to CSV...')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg text-orange-600"></span>
        <span className="ml-3 text-gray-600">Loading service records...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 mb-3 text-4xl">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Service Records</h3>
        <p className="text-red-600">Unable to fetch maintenance data. Please try again later.</p>
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
                placeholder="Search vehicles, service types, service IDs..."
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
            <button 
              onClick={handleExportCSV}
              className="btn btn-outline"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <MaintenanceFilters 
        showFilters={showFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <MaintenanceTable 
        services={serviceRecords}
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

export default MaintenanceList