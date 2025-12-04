// src/components/admin/CitySummary.tsx
import React, { useState } from 'react'
import { MapPin, Building2, Users, Eye, Search } from 'lucide-react'
import { BranchApi } from '../../../features/Api/BranchApi'

const CitySummary: React.FC = () => {
    const { data: citySummary, isLoading } = BranchApi.useGetBranchesByCitySummaryQuery()
    const { data: allBranches } = BranchApi.useGetAllBranchesQuery()
    const [selectedCity, setSelectedCity] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCitySummary = citySummary?.filter(city =>
        city.city.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    const branchesInSelectedCity = allBranches?.filter(branch => 
        selectedCity && branch.city === selectedCity
    ) || []

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <span className="ml-3 text-gray-600">Loading city summary...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search cities..."
                        className="input input-bordered w-full pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* City Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCitySummary.map((city) => (
                    <div 
                        key={city.city} 
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedCity(city.city)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <MapPin className="text-blue-500" size={20} />
                                {city.city}
                            </h3>
                            <span className="badge badge-primary badge-lg">
                                {city.branch_count} {city.branch_count === 1 ? 'Branch' : 'Branches'}
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Building2 size={14} />
                                    Active Branches
                                </span>
                                <span className="font-semibold text-green-600">{city.active_branches}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Users size={14} />
                                    Managed Branches
                                </span>
                                <span className="font-semibold text-blue-600">{city.managed_branches}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Coverage</span>
                                <span className="font-semibold text-purple-600">
                                    {Math.round((city.managed_branches / city.branch_count) * 100)}%
                                </span>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <button 
                                className="btn btn-outline btn-sm w-full gap-2"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedCity(city.city)
                                }}
                            >
                                <Eye size={14} />
                                View Branches
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected City Details */}
            {selectedCity && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <MapPin className="text-blue-500" size={20} />
                            Branches in {selectedCity}
                        </h3>
                        <button 
                            onClick={() => setSelectedCity(null)}
                            className="btn btn-ghost btn-sm"
                        >
                            Close
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {branchesInSelectedCity.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No branches found in {selectedCity}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table table-zebra w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-left font-semibold text-gray-700">Branch Name</th>
                                            <th className="text-left font-semibold text-gray-700">Address</th>
                                            <th className="text-left font-semibold text-gray-700">Phone</th>
                                            <th className="text-left font-semibold text-gray-700">Status</th>
                                            <th className="text-left font-semibold text-gray-700">Manager</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {branchesInSelectedCity.map((branch) => (
                                            <tr key={branch.branch_id} className="hover:bg-gray-50">
                                                <td className="font-semibold text-gray-800">{branch.branch_name}</td>
                                                <td className="text-sm text-gray-600 max-w-xs truncate">{branch.address}</td>
                                                <td className="text-sm text-gray-600">{branch.phone || 'Not set'}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        branch.is_active ? 'badge-success' : 'badge-error'
                                                    }`}>
                                                        {branch.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {branch.manager_id ? (
                                                        <span className="badge badge-success badge-sm">
                                                            Manager #{branch.manager_id}
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-ghost badge-sm">Unassigned</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!citySummary || citySummary.length === 0) && !isLoading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Cities Found</h3>
                    <p className="text-gray-500">No branch cities available to display.</p>
                </div>
            )}
        </div>
    )
}

export default CitySummary