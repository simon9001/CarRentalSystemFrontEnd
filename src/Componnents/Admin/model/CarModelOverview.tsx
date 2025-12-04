// src/components/admin/CarModelOverview.tsx
import React, { useState, useMemo } from 'react'
import { Search, Filter, Eye, Edit, Trash2, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react'
import { type CarModelResponse } from '../../../types/modelTypes'

interface CarModelOverviewProps {
    carModels: CarModelResponse[]
    isLoading: boolean
    error: any
    onViewModel: (id: number) => void
    onEditModel: (id: number) => void
    onRateModel: (id: number) => void
    onToggleStatus: (id: number, currentStatus: boolean) => void
    onDeleteModel: (id: number, name: string) => void
}

const CarModelOverview: React.FC<CarModelOverviewProps> = ({
    carModels,
    isLoading,
    error,
    onViewModel,
    onEditModel,
    onRateModel,
    onToggleStatus,
    onDeleteModel
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [makeFilter, setMakeFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [fuelFilter, setFuelFilter] = useState('all')
    const [transmissionFilter, setTransmissionFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    // Get unique filters
    const makes = useMemo(() => 
        Array.from(new Set(carModels.map(m => m.make))), 
        [carModels]
    )
    const vehicleTypes = useMemo(() => 
        Array.from(new Set(carModels.map(m => m.vehicle_type))), 
        [carModels]
    )
    const fuelTypes = useMemo(() => 
        Array.from(new Set(carModels.map(m => m.fuel_type))), 
        [carModels]
    )
    const transmissions = useMemo(() => 
        Array.from(new Set(carModels.map(m => m.transmission))), 
        [carModels]
    )

    // Filter car models
    const filteredCarModels = useMemo(() => {
        return carModels.filter(model => {
            const matchesSearch = 
                model.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                model.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                model.year.toString().includes(searchTerm)
            
            const matchesMake = makeFilter === 'all' || model.make === makeFilter
            const matchesType = typeFilter === 'all' || model.vehicle_type === typeFilter
            const matchesFuel = fuelFilter === 'all' || model.fuel_type === fuelFilter
            const matchesTransmission = transmissionFilter === 'all' || model.transmission === transmissionFilter
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && model.is_active) ||
                (statusFilter === 'inactive' && !model.is_active)

            return matchesSearch && matchesMake && matchesType && matchesFuel && matchesTransmission && matchesStatus
        })
    }, [carModels, searchTerm, makeFilter, typeFilter, fuelFilter, transmissionFilter, statusFilter])

    // Get status badge
    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <span className="badge badge-success badge-sm">
                <ToggleRight size={12} className="mr-1" />
                Active
            </span>
        ) : (
            <span className="badge badge-error badge-sm">
                <ToggleLeft size={12} className="mr-1" />
                Inactive
            </span>
        )
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                <span className="ml-3 text-gray-600">Loading car models...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Filter className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Car Models</h3>
                <p className="text-red-600">Unable to fetch car models. Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by make, model, or year..."
                                className="input input-bordered w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        <select 
                            className="select select-bordered select-sm"
                            value={makeFilter}
                            onChange={(e) => setMakeFilter(e.target.value)}
                        >
                            <option value="all">All Makes</option>
                            {makes.map(make => (
                                <option key={make} value={make}>{make}</option>
                            ))}
                        </select>

                        <select 
                            className="select select-bordered select-sm"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            {vehicleTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <select 
                            className="select select-bordered select-sm"
                            value={fuelFilter}
                            onChange={(e) => setFuelFilter(e.target.value)}
                        >
                            <option value="all">All Fuel Types</option>
                            {fuelTypes.map(fuel => (
                                <option key={fuel} value={fuel}>{fuel}</option>
                            ))}
                        </select>

                        <select 
                            className="select select-bordered select-sm"
                            value={transmissionFilter}
                            onChange={(e) => setTransmissionFilter(e.target.value)}
                        >
                            <option value="all">All Transmissions</option>
                            {transmissions.map(transmission => (
                                <option key={transmission} value={transmission}>{transmission}</option>
                            ))}
                        </select>

                        <select 
                            className="select select-bordered select-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="text-left font-semibold text-gray-700">Make & Model</th>
                            <th className="text-left font-semibold text-gray-700">Year</th>
                            <th className="text-left font-semibold text-gray-700">Type</th>
                            <th className="text-left font-semibold text-gray-700">Fuel</th>
                            <th className="text-left font-semibold text-gray-700">Transmission</th>
                            <th className="text-left font-semibold text-gray-700">Seating</th>
                            <th className="text-left font-semibold text-gray-700">Daily Rate</th>
                            <th className="text-left font-semibold text-gray-700">Status</th>
                            <th className="text-center font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCarModels.map((model) => (
                            <tr key={model.model_id} className="hover:bg-gray-50">
                                <td>
                                    <div>
                                        <div className="font-bold text-gray-800">{model.make}</div>
                                        <div className="text-sm text-gray-600">{model.model}</div>
                                    </div>
                                </td>
                                <td className="font-medium">{model.year}</td>
                                <td>
                                    <span className="badge badge-outline badge-sm">
                                        {model.vehicle_type}
                                    </span>
                                </td>
                                <td>
                                    <span className="text-sm text-gray-600">{model.fuel_type}</span>
                                </td>
                                <td>
                                    <span className="text-sm text-gray-600">{model.transmission}</span>
                                </td>
                                <td>
                                    <span className="font-medium">
                                        {model.seating_capacity} seats
                                    </span>
                                </td>
                                <td>
                                    <span className="font-bold text-green-600">
                                        ${model.standard_daily_rate}
                                    </span>
                                </td>
                                <td>
                                    {getStatusBadge(model.is_active)}
                                </td>
                                <td>
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => onViewModel(model.model_id)}
                                            className="btn btn-ghost btn-xs text-blue-600"
                                            title="View Details"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            onClick={() => onEditModel(model.model_id)}
                                            className="btn btn-ghost btn-xs text-green-600"
                                            title="Edit Model"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => onRateModel(model.model_id)}
                                            className="btn btn-ghost btn-xs text-yellow-600"
                                            title="Update Rate"
                                        >
                                            <DollarSign size={14} />
                                        </button>
                                        <button
                                            onClick={() => onToggleStatus(model.model_id, model.is_active)}
                                            className={`btn btn-ghost btn-xs ${
                                                model.is_active ? 'text-orange-600' : 'text-green-600'
                                            }`}
                                            title={model.is_active ? 'Disable Model' : 'Enable Model'}
                                        >
                                            {model.is_active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                                        </button>
                                        <button
                                            onClick={() => onDeleteModel(model.model_id, `${model.make} ${model.model}`)}
                                            className="btn btn-ghost btn-xs text-red-600"
                                            title="Delete Model"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCarModels.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No car models found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Showing {filteredCarModels.length} of {carModels.length} models
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                        <span>Active: {carModels.filter(m => m.is_active).length}</span>
                        <span>Inactive: {carModels.filter(m => !m.is_active).length}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CarModelOverview