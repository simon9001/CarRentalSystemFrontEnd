// components/admin/VehicleDetailsModal.tsx
import React from 'react'
import { X, Car, Calendar, Gauge, MapPin, Wrench, Shield, DollarSign } from 'lucide-react'
import { VehicleApi } from '../../../features/Api/VehicleApi'

interface VehicleDetailsModalProps {
    vehicleId: number
    onClose: () => void
    onEdit: () => void
}

const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ vehicleId, onClose, onEdit }) => {
    const { data: vehicle, isLoading } = VehicleApi.useGetVehicleByIdQuery(vehicleId)

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-8">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                </div>
            </div>
        )
    }

    if (!vehicle) {
        return null
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {vehicle.make} {vehicle.model} {vehicle.year}
                        </h2>
                        <p className="text-gray-600">#{vehicle.vehicle_id} • {vehicle.registration_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onEdit} className="btn btn-primary btn-sm">
                            Edit Vehicle
                        </button>
                        <button onClick={onClose} className="btn btn-ghost btn-circle">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[80vh]">
                    <div className="p-6">
                        {/* Image Gallery */}
                        <div className="mb-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {vehicle.images && vehicle.images.length > 0 ? (
                                    <>
                                        <div className="lg:col-span-2">
                                            <img
                                                src={vehicle.images[0].image_url}
                                                alt={vehicle.registration_number}
                                                className="w-full h-80 object-cover rounded-lg"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {vehicle.images.slice(1).map((image, index) => (
                                                <img
                                                    key={image.image_id}
                                                    src={image.image_url}
                                                    alt={`${vehicle.registration_number} ${index + 2}`}
                                                    className="w-full h-40 object-cover rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="col-span-3 bg-gray-100 rounded-lg h-80 flex items-center justify-center">
                                        <Car size={48} className="text-gray-400" />
                                        <span className="ml-2 text-gray-500">No images available</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vehicle Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Basic Information */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Car size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">Make & Model:</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                <span className="text-sm text-gray-600">Color:</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Gauge size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">Mileage:</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">Daily Rate:</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                                            <div className="font-medium">{vehicle.color}</div>
                                            <div className="font-medium">{vehicle.current_mileage.toLocaleString()} km</div>
                                            <div className="font-medium text-green-600">${vehicle.effective_daily_rate}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Specifications */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-600">Vehicle Type</div>
                                            <div className="font-medium">{vehicle.vehicle_type}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Fuel Type</div>
                                            <div className="font-medium">{vehicle.fuel_type}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Transmission</div>
                                            <div className="font-medium">{vehicle.transmission}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Seating Capacity</div>
                                            <div className="font-medium">{vehicle.seating_capacity} people</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Doors</div>
                                            <div className="font-medium">{vehicle.doors}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">VIN</div>
                                            <div className="font-mono font-medium">{vehicle.vin_number}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Maintenance */}
                            <div className="space-y-6">
                                {/* Current Status */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Status</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">Status</span>
                                            <span className={`badge ${
                                                vehicle.status === 'Available' ? 'badge-success' :
                                                vehicle.status === 'Booked' ? 'badge-warning' :
                                                vehicle.status === 'Under Maintenance' ? 'badge-error' :
                                                'badge-ghost'
                                            }`}>
                                                {vehicle.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Branch</span>
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                {vehicle.branch_name || 'Unassigned'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Maintenance Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Maintenance</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Shield size={16} className="text-blue-600" />
                                                <span className="text-sm">Insurance Expiry</span>
                                            </div>
                                            <span className={`text-sm font-medium ${
                                                vehicle.insurance_expiry_date && new Date(vehicle.insurance_expiry_date) < new Date()
                                                    ? 'text-red-600'
                                                    : 'text-gray-700'
                                            }`}>
                                                {formatDate(vehicle.insurance_expiry_date)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Wrench size={16} className="text-orange-600" />
                                                <span className="text-sm">Service Due Date</span>
                                            </div>
                                            <span className={`text-sm font-medium ${
                                                vehicle.service_due_date && new Date(vehicle.service_due_date) < new Date()
                                                    ? 'text-red-600'
                                                    : 'text-gray-700'
                                            }`}>
                                                {formatDate(vehicle.service_due_date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Features */}
                                {vehicle.custom_features && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Custom Features</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {vehicle.custom_features.split(',').map((feature, index) => (
                                                    <span key={index} className="badge badge-outline">
                                                        {feature.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {vehicle.notes && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-700">{vehicle.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* History Sections - Placeholder */}
                        <div className="mt-8 border-t border-gray-200 pt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle History</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <Calendar size={24} className="mx-auto text-gray-400 mb-2" />
                                    <div className="font-semibold">Booking History</div>
                                    <div className="text-sm text-gray-600">Coming soon</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <Wrench size={24} className="mx-auto text-gray-400 mb-2" />
                                    <div className="font-semibold">Maintenance History</div>
                                    <div className="text-sm text-gray-600">Coming soon</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <Gauge size={24} className="mx-auto text-gray-400 mb-2" />
                                    <div className="font-semibold">Mileage Logs</div>
                                    <div className="text-sm text-gray-600">Coming soon</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VehicleDetailsModal