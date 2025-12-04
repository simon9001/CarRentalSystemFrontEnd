// src/components/admin/EditCarModelModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Car, Fuel, Cog, Users, DoorOpen } from 'lucide-react'
import { CarModelApi } from '../../../features/Api/CarModelApi'
import Swal from 'sweetalert2'
import { type UpdateCarModelRequest } from '../../../types/modelTypes'

interface EditCarModelModalProps {
    modelId: number
    onClose: () => void
    onSuccess: () => void
}

const EditCarModelModal: React.FC<EditCarModelModalProps> = ({ modelId, onClose, onSuccess }) => {
    const { data: model, isLoading } = CarModelApi.useGetCarModelByIdQuery(modelId)
    const [updateCarModel] = CarModelApi.useUpdateCarModelMutation()
    
    const [formData, setFormData] = useState<UpdateCarModelRequest>({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vehicle_type: '',
        fuel_type: '',
        transmission: '',
        seating_capacity: 5,
        doors: 4,
        standard_daily_rate: 0,
        engine_size: '',
        fuel_efficiency_city: undefined,
        fuel_efficiency_highway: undefined,
        standard_features: '',
        is_active: true
    })

    const [features, setFeatures] = useState<string[]>([])
    const [currentFeature, setCurrentFeature] = useState('')

    useEffect(() => {
        if (model) {
            setFormData({
                make: model.make,
                model: model.model,
                year: model.year,
                vehicle_type: model.vehicle_type,
                fuel_type: model.fuel_type,
                transmission: model.transmission,
                seating_capacity: model.seating_capacity,
                doors: model.doors,
                standard_daily_rate: model.standard_daily_rate,
                engine_size: model.engine_size || '',
                fuel_efficiency_city: model.fuel_efficiency_city || undefined,
                fuel_efficiency_highway: model.fuel_efficiency_highway || undefined,
                standard_features: model.standard_features || '',
                is_active: model.is_active
            })

            // Parse existing features
            if (model.standard_features) {
                try {
                    const parsedFeatures = JSON.parse(model.standard_features)
                    setFeatures(Array.isArray(parsedFeatures) ? parsedFeatures : [])
                } catch {
                    setFeatures(model.standard_features.split(',').map(f => f.trim()))
                }
            }
        }
    }, [model])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'year' || name === 'seating_capacity' || name === 'doors' || name === 'standard_daily_rate' || 
                     name === 'fuel_efficiency_city' || name === 'fuel_efficiency_highway'
                ? value ? Number(value) : undefined 
                : value
        }))
    }

    const addFeature = () => {
        if (currentFeature.trim() && !features.includes(currentFeature.trim())) {
            setFeatures(prev => [...prev, currentFeature.trim()])
            setCurrentFeature('')
        }
    }

    const removeFeature = (featureToRemove: string) => {
        setFeatures(prev => prev.filter(f => f !== featureToRemove))
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addFeature()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate required fields
        if (!formData.make || !formData.model || !formData.vehicle_type || !formData.fuel_type || !formData.transmission) {
            Swal.fire('Error!', 'Please fill in all required fields.', 'error')
            return
        }

        // Validate year
        const currentYear = new Date().getFullYear()
        if (formData.year < 1990 || formData.year > currentYear + 1) {
            Swal.fire('Error!', `Year must be between 1990 and ${currentYear + 1}.`, 'error')
            return
        }

        // Validate daily rate
        if (formData.standard_daily_rate <= 0) {
            Swal.fire('Error!', 'Daily rate must be greater than 0.', 'error')
            return
        }

        try {
            const submissionData = {
                ...formData,
                standard_features: features.length > 0 ? JSON.stringify(features) : undefined
            }
            
            await updateCarModel({ model_id: modelId, updates: submissionData }).unwrap()
            onSuccess()
        } catch (error) {
            Swal.fire('Error!', 'Failed to update car model.', 'error')
        }
    }

    const vehicleTypes: string[] = ['Sedan', 'SUV', 'Truck', 'Van', 'Coupe', 'Convertible', 'Hatchback', 'Electric', 'Hybrid']
    const fuelTypes: string[] = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid']
    const transmissionTypes: string[] = ['Automatic', 'Manual', 'CVT', 'Semi-Automatic']

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: currentYear - 1990 + 2 }, (_, i) => currentYear + 1 - i)

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-8">
                    <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                </div>
            </div>
        )
    }

    if (!model) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                        Edit Car Model - {model.make} {model.model}
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Car size={20} />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Make *</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="make"
                                            value={formData.make}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Model *</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="model"
                                            value={formData.model}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Year *</span>
                                        </label>
                                        <select 
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            className="select select-bordered"
                                            required
                                        >
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Vehicle Type *</span>
                                        </label>
                                        <select 
                                            name="vehicle_type"
                                            value={formData.vehicle_type}
                                            onChange={handleInputChange}
                                            className="select select-bordered"
                                            required
                                        >
                                            {vehicleTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Fuel Type *</span>
                                        </label>
                                        <select 
                                            name="fuel_type"
                                            value={formData.fuel_type}
                                            onChange={handleInputChange}
                                            className="select select-bordered"
                                            required
                                        >
                                            {fuelTypes.map(fuel => (
                                                <option key={fuel} value={fuel}>{fuel}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Transmission *</span>
                                        </label>
                                        <select 
                                            name="transmission"
                                            value={formData.transmission}
                                            onChange={handleInputChange}
                                            className="select select-bordered"
                                            required
                                        >
                                            {transmissionTypes.map(transmission => (
                                                <option key={transmission} value={transmission}>{transmission}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Capacity & Dimensions */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Users size={20} />
                                    Capacity & Dimensions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Seating Capacity *</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="seating_capacity"
                                            value={formData.seating_capacity}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            min="1"
                                            max="20"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Doors *</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="doors"
                                            value={formData.doors}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            min="2"
                                            max="6"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Engine Size</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="engine_size"
                                            value={formData.engine_size}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="e.g., 2.0L"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Daily Rate *</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="standard_daily_rate"
                                            value={formData.standard_daily_rate}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fuel Efficiency */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Fuel size={20} />
                                    Fuel Efficiency (Optional)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">City MPG</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="fuel_efficiency_city"
                                            value={formData.fuel_efficiency_city || ''}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="Miles per gallon"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Highway MPG</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="fuel_efficiency_highway"
                                            value={formData.fuel_efficiency_highway || ''}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="Miles per gallon"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Standard Features */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Cog size={20} />
                                    Standard Features
                                </h3>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Add Features</span>
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={currentFeature}
                                            onChange={(e) => setCurrentFeature(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="input input-bordered flex-1"
                                            placeholder="Enter a feature and press Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={addFeature}
                                            className="btn btn-primary"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    
                                    {features.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                                            {features.map((feature, index) => (
                                                <span key={index} className="badge badge-primary badge-lg gap-1">
                                                    {feature}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFeature(feature)}
                                                        className="btn btn-ghost btn-xs btn-circle"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
                                <div className="form-control">
                                    <label className="label cursor-pointer justify-start gap-3">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                is_active: e.target.checked
                                            }))}
                                            className="checkbox checkbox-primary"
                                        />
                                        <span className="label-text font-semibold">Active Model</span>
                                    </label>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Inactive models won't be available for new vehicle assignments
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Update Car Model
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditCarModelModal