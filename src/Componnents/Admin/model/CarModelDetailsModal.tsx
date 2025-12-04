// src/components/admin/CarModelDetailsModal.tsx
import React from 'react'
import { X, Car, Fuel, Cog, Users, DoorOpen, Calendar, DollarSign, ToggleLeft, ToggleRight, Edit, Clock } from 'lucide-react'
import { CarModelApi } from '../../../features/Api/CarModelApi'

interface CarModelDetailsModalProps {
    modelId: number
    onClose: () => void
    onEdit: () => void
    onRate: () => void
}

const CarModelDetailsModal: React.FC<CarModelDetailsModalProps> = ({ modelId, onClose, onEdit, onRate }) => {
    const { data: model, isLoading } = CarModelApi.useGetCarModelByIdQuery(modelId)

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-8">
                    <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                </div>
            </div>
        )
    }

    if (!model) {
        return null
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const parseFeatures = (featuresString: string | null): string[] => {
        if (!featuresString) return []
        try {
            return JSON.parse(featuresString)
        } catch {
            return featuresString.split(',').map(f => f.trim())
        }
    }

    const features = parseFeatures(model.standard_features)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {model.make} {model.model} {model.year}
                        </h2>
                        <p className="text-gray-600">Model ID: #{model.model_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onRate} className="btn btn-warning btn-sm gap-2">
                            <DollarSign size={16} />
                            Update Rate
                        </button>
                        <button onClick={onEdit} className="btn btn-primary btn-sm gap-2">
                            <Edit size={16} />
                            Edit Model
                        </button>
                        <button onClick={onClose} className="btn btn-ghost btn-circle">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[80vh]">
                    <div className="p-6">
                        {/* Status Banner */}
                        <div className={`p-4 rounded-lg mb-6 ${
                            model.is_active 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {model.is_active ? (
                                        <ToggleRight className="text-green-600" size={24} />
                                    ) : (
                                        <ToggleLeft className="text-red-600" size={24} />
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {model.is_active ? 'Active Model' : 'Inactive Model'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {model.is_active 
                                                ? 'This model is available for vehicle assignments' 
                                                : 'This model is not available for new vehicle assignments'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <span className={`badge badge-lg ${
                                    model.is_active ? 'badge-success' : 'badge-error'
                                }`}>
                                    {model.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Basic Information */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Car size={20} />
                                        Basic Information
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-600">Make</div>
                                                <div className="font-semibold">{model.make}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Model</div>
                                                <div className="font-semibold">{model.model}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Year</div>
                                                <div className="font-semibold">{model.year}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Vehicle Type</div>
                                                <div className="font-semibold">{model.vehicle_type}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Specifications */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Cog size={20} />
                                        Specifications
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-600">Fuel Type</div>
                                                <div className="font-semibold">{model.fuel_type}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Transmission</div>
                                                <div className="font-semibold">{model.transmission}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Engine Size</div>
                                                <div className="font-semibold">{model.engine_size || 'Not specified'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fuel Efficiency */}
                                {(model.fuel_efficiency_city || model.fuel_efficiency_highway) && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Fuel size={20} />
                                            Fuel Efficiency
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                {model.fuel_efficiency_city && (
                                                    <div>
                                                        <div className="text-sm text-gray-600">City MPG</div>
                                                        <div className="font-semibold">{model.fuel_efficiency_city} MPG</div>
                                                    </div>
                                                )}
                                                {model.fuel_efficiency_highway && (
                                                    <div>
                                                        <div className="text-sm text-gray-600">Highway MPG</div>
                                                        <div className="font-semibold">{model.fuel_efficiency_highway} MPG</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Capacity & Pricing */}
                            <div className="space-y-6">
                                {/* Capacity */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Users size={20} />
                                        Capacity & Layout
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-600">Seating Capacity</div>
                                                <div className="font-semibold flex items-center gap-2">
                                                    <Users size={16} />
                                                    {model.seating_capacity} people
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Doors</div>
                                                <div className="font-semibold flex items-center gap-2">
                                                    <DoorOpen size={16} />
                                                    {model.doors} doors
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <DollarSign size={20} />
                                        Pricing
                                    </h3>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-600 mb-1">Standard Daily Rate</div>
                                            <div className="text-3xl font-bold text-green-600">
                                                ${model.standard_daily_rate}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">per day</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Clock size={20} />
                                        Timestamps
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div>
                                            <div className="text-sm text-gray-600">Created</div>
                                            <div className="font-semibold text-sm">{formatDate(model.created_at)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Last Updated</div>
                                            <div className="font-semibold text-sm">{formatDate(model.updated_at)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Standard Features */}
                        {features.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Standard Features</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {features.map((feature, index) => (
                                            <span key={index} className="badge badge-primary badge-lg">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Linked Vehicles Section - Placeholder */}
                        <div className="mt-8 border-t border-gray-200 pt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Linked Vehicles</h3>
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <Car className="mx-auto text-gray-400 mb-3" size={32} />
                                <div className="font-semibold text-gray-700 mb-2">Vehicle Management</div>
                                <div className="text-sm text-gray-500">
                                    View and manage vehicles using this model in the Vehicle Management section
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CarModelDetailsModal