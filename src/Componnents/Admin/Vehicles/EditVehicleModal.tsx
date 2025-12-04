// components/admin/EditVehicleModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Trash2, Save, RefreshCw, Camera, Shield, Wrench, Calendar, DollarSign, MapPin, Gauge, Car, Check, AlertCircle, Info, Tag, FileText, Sparkles } from 'lucide-react'
import { VehicleApi } from '../../../features/Api/VehicleApi'
import Swal from 'sweetalert2'
import { type UpdateVehicleRequest, type VehicleImage, type AddVehicleImageRequest } from '../../../types/vehicletype'

interface EditVehicleModalProps {
    vehicleId: number
    onClose: () => void
    onSuccess: () => void
}

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({ vehicleId, onClose, onSuccess }) => {
    const { data: vehicle, isLoading, refetch } = VehicleApi.useGetVehicleByIdQuery(vehicleId)
    const { data: carModels } = VehicleApi.useGetAllCarModelsQuery()
    const { data: branches } = VehicleApi.useGetAllBranchesQuery()
    const [updateVehicle, { isLoading: isUpdating }] = VehicleApi.useUpdateVehicleMutation()
    const [addVehicleImage, { isLoading: isAddingImage }] = VehicleApi.useAddVehicleImageMutation()
    const [deleteVehicleImage, { isLoading: isDeletingImage }] = VehicleApi.useDeleteVehicleImageMutation()
    const [setPrimaryImage, { isLoading: isSettingPrimary }] = VehicleApi.useSetPrimaryImageMutation()

    const [formData, setFormData] = useState<UpdateVehicleRequest>({
        model_id: 0,
        registration_number: '',
        color: '',
        vin_number: '',
        current_mileage: 0,
        status: '',
        branch_id: undefined,
        insurance_expiry_date: '',
        service_due_date: '',
        actual_daily_rate: undefined,
        custom_features: '',
        notes: ''
    })

    const [newImages, setNewImages] = useState<File[]>([])
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
    const [activeSection, setActiveSection] = useState<'basic' | 'maintenance' | 'images' | 'features'>('basic')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (vehicle) {
            setFormData({
                model_id: vehicle.model_id,
                registration_number: vehicle.registration_number,
                color: vehicle.color,
                vin_number: vehicle.vin_number,
                current_mileage: vehicle.current_mileage,
                status: vehicle.status,
                branch_id: vehicle.branch_id || undefined,
                insurance_expiry_date: vehicle.insurance_expiry_date || '',
                service_due_date: vehicle.service_due_date || '',
                actual_daily_rate: vehicle.actual_daily_rate || undefined,
                custom_features: vehicle.custom_features || '',
                notes: vehicle.notes || ''
            })
        }
    }, [vehicle])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'model_id' || name === 'current_mileage' || name === 'branch_id' || name === 'actual_daily_rate' 
                ? value ? Number(value) : undefined 
                : value
        }))
    }

    const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length + newImages.length > 10) {
            Swal.fire({
                title: 'Too many images',
                text: 'You can upload up to 10 images maximum',
                icon: 'warning',
                confirmButtonText: 'OK'
            })
            return
        }
        
        const updatedImages = [...newImages, ...files]
        setNewImages(updatedImages)
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    title: 'Invalid file',
                    text: 'Please upload image files only',
                    icon: 'error',
                    confirmButtonText: 'OK'
                })
                return
            }
            
            const reader = new FileReader()
            reader.onload = (e) => {
                setNewImagePreviews(prev => [...prev, e.target?.result as string])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeNewImage = (index: number) => {
        const updatedImages = newImages.filter((_, i) => i !== index)
        const updatedPreviews = newImagePreviews.filter((_, i) => i !== index)
        setNewImages(updatedImages)
        setNewImagePreviews(updatedPreviews)
    }

    const handleDeleteImage = async (imageId: number) => {
        const result = await Swal.fire({
            title: 'Delete Image?',
            text: "This image will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    return await deleteVehicleImage(imageId).unwrap()
                } catch (error: any) {
                    Swal.showValidationMessage(
                        error?.data?.message || 'Failed to delete image'
                    )
                }
            }
        })

        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Image has been deleted successfully.',
                'success'
            )
        }
    }

    const handleSetPrimaryImage = async (imageId: number) => {
        try {
            await setPrimaryImage({ vehicle_id: vehicleId, image_id: imageId }).unwrap()
            Swal.fire({
                title: 'Success!',
                text: 'Primary image updated.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            })
        } catch (error: any) {
            Swal.fire('Error!', error?.data?.message || 'Failed to update primary image.', 'error')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        try {
            // Validate form
            if (!formData.status) {
                throw new Error('Status is required')
            }
            if (!formData.current_mileage || formData.current_mileage < 0) {
                throw new Error('Valid current mileage is required')
            }

            await updateVehicle({ vehicle_id: vehicleId, updates: formData }).unwrap()
            
            // Upload new images if any
            if (newImages.length > 0) {
                Swal.fire({
                    title: 'Uploading Images...',
                    text: 'Please wait while images are being uploaded',
                    icon: 'info',
                    showConfirmButton: false,
                    allowOutsideClick: false
                })
                
                const uploadPromises = newImages.map(async (file, index) => {
                    const imageData: AddVehicleImageRequest = {
                        image_url: URL.createObjectURL(file), // In production, upload to cloud storage first
                        image_type: file.type,
                        is_primary: false,
                        display_order: (vehicle?.images?.length || 0) + index
                    }
                    return await addVehicleImage({ vehicle_id: vehicleId, image: imageData }).unwrap()
                })
                
                await Promise.all(uploadPromises)
                Swal.close()
            }
            
            Swal.fire({
                title: 'Success!',
                text: 'Vehicle updated successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            })
            
            onSuccess()
        } catch (error: any) {
            Swal.fire({
                title: 'Error!',
                text: error?.message || error?.data?.message || 'Failed to update vehicle.',
                icon: 'error',
                confirmButtonText: 'OK'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRefresh = () => {
        refetch()
        Swal.fire({
            title: 'Refreshing...',
            text: 'Fetching latest vehicle data',
            icon: 'info',
            timer: 1000,
            showConfirmButton: false
        })
    }

    const groupedModels = carModels?.reduce((acc, model) => {
        if (!acc[model.make]) acc[model.make] = []
        acc[model.make].push(model)
        return acc
    }, {} as Record<string, any[]>)

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Available': return 'badge-success';
            case 'Booked': return 'badge-warning';
            case 'Under Maintenance': return 'badge-error';
            case 'Retired': return 'badge-neutral';
            case 'Rented': return 'badge-info';
            default: return 'badge-ghost';
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not set'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Vehicle Data</h3>
                    <p className="text-gray-600">Fetching vehicle details...</p>
                </div>
            </div>
        )
    }

    if (!vehicle) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Vehicle Not Found</h3>
                    <p className="text-gray-600 mb-6">The vehicle you're trying to edit could not be found.</p>
                    <button
                        onClick={onClose}
                        className="btn btn-primary"
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden my-8">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Car className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    Edit Vehicle - {vehicle.registration_number}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm opacity-90">
                                        {vehicle.make} {vehicle.model} • {vehicle.year}
                                    </span>
                                    <span className={`badge badge-sm ${getStatusColor(vehicle.status)}`}>
                                        {vehicle.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                className="btn btn-ghost btn-circle text-white hover:bg-white/20"
                                title="Refresh data"
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={onClose}
                                className="btn btn-ghost btn-circle text-white hover:bg-white/20"
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="sticky top-[88px] bg-white border-b border-gray-200 z-10 px-6">
                    <nav className="flex overflow-x-auto scrollbar-hide -mb-px">
                        <button
                            type="button"
                            onClick={() => setActiveSection('basic')}
                            className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                activeSection === 'basic'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Info className="w-4 h-4" />
                            Basic Information
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSection('maintenance')}
                            className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                activeSection === 'maintenance'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Wrench className="w-4 h-4" />
                            Maintenance
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSection('images')}
                            className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                activeSection === 'images'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Camera className="w-4 h-4" />
                            Images
                            {(vehicle.images?.length || 0) + newImages.length > 0 && (
                                <span className="badge badge-primary badge-sm">
                                    {(vehicle.images?.length || 0) + newImages.length}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSection('features')}
                            className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                activeSection === 'features'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            Features & Notes
                        </button>
                    </nav>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {/* Basic Information Section */}
                        {activeSection === 'basic' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <Tag className="w-4 h-4" />
                                                Registration Number *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="registration_number"
                                            value={formData.registration_number}
                                            onChange={handleInputChange}
                                            className="input input-bordered input-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                            disabled
                                            title="Registration number cannot be changed"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <Tag className="w-4 h-4" />
                                                VIN Number *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="vin_number"
                                            value={formData.vin_number}
                                            onChange={handleInputChange}
                                            className="input input-bordered input-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                            disabled
                                            title="VIN number cannot be changed"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <Car className="w-4 h-4" />
                                                Color *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleInputChange}
                                            className="input input-bordered input-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <Gauge className="w-4 h-4" />
                                                Current Mileage (km) *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            name="current_mileage"
                                            value={formData.current_mileage}
                                            onChange={handleInputChange}
                                            className="input input-bordered input-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                            min="0"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                Daily Rate
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                            <input
                                                type="number"
                                                name="actual_daily_rate"
                                                value={formData.actual_daily_rate || ''}
                                                onChange={handleInputChange}
                                                className="input input-bordered input-lg pl-8 focus:ring-2 focus:ring-blue-500"
                                                placeholder="Override standard rate"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Branch
                                            </span>
                                        </label>
                                        <select 
                                            name="branch_id"
                                            value={formData.branch_id || ''}
                                            onChange={handleInputChange}
                                            className="select select-bordered select-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Branch</option>
                                            {branches?.map(branch => (
                                                <option key={branch.branch_id} value={branch.branch_id}>
                                                    {branch.branch_name} - {branch.city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <Tag className="w-4 h-4" />
                                                Status *
                                            </span>
                                        </label>
                                        <select 
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="select select-bordered select-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Available">Available</option>
                                            <option value="Booked">Booked</option>
                                            <option value="Under Maintenance">Under Maintenance</option>
                                            <option value="Retired">Retired</option>
                                            <option value="Rented">Rented</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Model Selection */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold flex items-center gap-2">
                                            <Car className="w-4 h-4" />
                                            Model (Cannot be changed)
                                        </span>
                                    </label>
                                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-gray-800">
                                                    {vehicle.make} {vehicle.model} {vehicle.year}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {vehicle.vehicle_type} • {vehicle.fuel_type} • {vehicle.transmission}
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-500 italic">Read-only</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Maintenance Section */}
                        {activeSection === 'maintenance' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Shield className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Insurance Information</h4>
                                                <p className="text-sm text-gray-600">Vehicle insurance details</p>
                                            </div>
                                        </div>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold">Insurance Expiry Date</span>
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="date"
                                                    name="insurance_expiry_date"
                                                    value={formData.insurance_expiry_date}
                                                    onChange={handleInputChange}
                                                    className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            {vehicle.insurance_expiry_date && (
                                                <div className="mt-2 text-sm">
                                                    <span className="text-gray-600">Current: </span>
                                                    <span className={`font-medium ${
                                                        new Date(vehicle.insurance_expiry_date) < new Date()
                                                            ? 'text-red-600'
                                                            : 'text-green-600'
                                                    }`}>
                                                        {formatDate(vehicle.insurance_expiry_date)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-200 p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                <Wrench className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Service Information</h4>
                                                <p className="text-sm text-gray-600">Next service due date</p>
                                            </div>
                                        </div>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold">Service Due Date</span>
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="date"
                                                    name="service_due_date"
                                                    value={formData.service_due_date}
                                                    onChange={handleInputChange}
                                                    className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            {vehicle.service_due_date && (
                                                <div className="mt-2 text-sm">
                                                    <span className="text-gray-600">Current: </span>
                                                    <span className={`font-medium ${
                                                        new Date(vehicle.service_due_date) < new Date()
                                                            ? 'text-red-600'
                                                            : 'text-green-600'
                                                    }`}>
                                                        {formatDate(vehicle.service_due_date)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Maintenance Alerts */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                        Maintenance Alerts
                                    </h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        {(!formData.insurance_expiry_date || new Date(formData.insurance_expiry_date) < new Date()) && (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                <span>Insurance has expired or no expiry date set</span>
                                            </div>
                                        )}
                                        {(!formData.service_due_date || new Date(formData.service_due_date) < new Date()) && (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                <span>Service is overdue or no due date set</span>
                                            </div>
                                        )}
                                        {formData.insurance_expiry_date && new Date(formData.insurance_expiry_date) >= new Date() && 
                                         formData.service_due_date && new Date(formData.service_due_date) >= new Date() && (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <Check className="w-4 h-4" />
                                                <span>All maintenance items are up to date</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Images Section */}
                        {activeSection === 'images' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Existing Images */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Vehicle Images</h3>
                                    {vehicle.images && vehicle.images.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {vehicle.images.map((image: VehicleImage) => (
                                                <div key={image.image_id} className="relative group">
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={image.image_url}
                                                            alt={`Vehicle image ${image.image_id}`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-3">
                                                        <div className="self-start">
                                                            {image.is_primary && (
                                                                <span className="badge badge-primary badge-sm">
                                                                    Primary
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-center gap-2">
                                                            {!image.is_primary && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSetPrimaryImage(image.image_id)}
                                                                    className="btn btn-primary btn-xs text-white"
                                                                    disabled={isSettingPrimary}
                                                                >
                                                                    {isSettingPrimary ? (
                                                                        <span className="loading loading-spinner loading-xs"></span>
                                                                    ) : 'Set Primary'}
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteImage(image.image_id)}
                                                                className="btn btn-error btn-xs text-white"
                                                                disabled={isDeletingImage}
                                                            >
                                                                {isDeletingImage ? (
                                                                    <span className="loading loading-spinner loading-xs"></span>
                                                                ) : <Trash2 className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <Camera className="mx-auto text-gray-400 mb-3" size={40} />
                                            <p className="text-gray-500">No images uploaded yet</p>
                                            <p className="text-sm text-gray-400 mt-1">Upload images using the section below</p>
                                        </div>
                                    )}
                                </div>

                                {/* Add New Images */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Images</h3>
                                    <div className="border-3 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-gradient-to-br from-gray-50 to-white">
                                        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Drag & Drop or Click to Upload</h4>
                                        <p className="text-gray-500 mb-4">Upload up to 10 images (JPG, PNG, WEBP)</p>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleNewImageUpload}
                                            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                                            disabled={newImages.length >= 10}
                                        />
                                        <p className="text-sm text-gray-400 mt-4">
                                            {newImages.length}/10 images selected • Max 5MB per image
                                        </p>
                                    </div>

                                    {newImagePreviews.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="font-semibold text-gray-700 mb-4">
                                                New Images to Upload ({newImagePreviews.length})
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {newImagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                            <img
                                                                src={preview}
                                                                alt={`New preview ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewImage(index)}
                                                            className="absolute -top-2 -right-2 btn btn-error btn-circle btn-xs text-white shadow-lg"
                                                            title="Remove image"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                        <div className="absolute bottom-2 left-2">
                                                            <span className="badge badge-info badge-xs">
                                                                New
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Features & Notes Section */}
                        {activeSection === 'features' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            Custom Features
                                        </h3>
                                        <div className="form-control">
                                            <textarea
                                                name="custom_features"
                                                value={formData.custom_features}
                                                onChange={handleInputChange}
                                                className="textarea textarea-bordered h-48 focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter custom features separated by commas...
                                                Example: Leather Seats, Sunroof, Navigation System, Heated Seats"
                                                rows={6}
                                            />
                                        </div>
                                        {vehicle.custom_features && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600 mb-2">Current features:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {vehicle.custom_features.split(',').map((feature, index) => (
                                                        <span key={index} className="badge badge-outline">
                                                            {feature.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Notes & Remarks
                                        </h3>
                                        <div className="form-control">
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                className="textarea textarea-bordered h-48 focus:ring-2 focus:ring-blue-500"
                                                placeholder="Additional notes, remarks, or special instructions...
                                                Example: Minor scratch on right rear door, AC needs servicing, Recent tire replacement"
                                                rows={6}
                                            />
                                        </div>
                                        {vehicle.notes && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-sm text-gray-600 mb-1">Current notes:</p>
                                                <p className="text-sm text-gray-800">{vehicle.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Info className="w-5 h-5" />
                                        Quick Actions
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    custom_features: 'Leather Seats, Sunroof, Navigation System, Heated Seats, Backup Camera, Bluetooth'
                                                }))
                                            }}
                                            className="btn btn-outline btn-sm justify-start"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Add Premium Features
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    custom_features: ''
                                                }))
                                            }}
                                            className="btn btn-outline btn-sm justify-start"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Clear All Features
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const today = new Date()
                                                const nextMonth = new Date(today.setMonth(today.getMonth() + 1))
                                                    .toISOString()
                                                    .split('T')[0]
                                                setFormData(prev => ({
                                                    ...prev,
                                                    service_due_date: nextMonth
                                                }))
                                            }}
                                            className="btn btn-outline btn-sm justify-start"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Set Service Next Month
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const today = new Date()
                                                const nextYear = new Date(today.setFullYear(today.getFullYear() + 1))
                                                    .toISOString()
                                                    .split('T')[0]
                                                setFormData(prev => ({
                                                    ...prev,
                                                    insurance_expiry_date: nextYear
                                                }))
                                            }}
                                            className="btn btn-outline btn-sm justify-start"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Set Insurance Next Year
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Vehicle ID:</span>
                                    <span className="font-mono">#{vehicle.vehicle_id}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    Last updated: {vehicle.updated_at ? formatDate(vehicle.updated_at) : 'Unknown'}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="btn btn-ghost"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary gap-2 min-w-[120px]"
                                    disabled={isSubmitting || isUpdating}
                                >
                                    {isSubmitting || isUpdating ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Update Vehicle
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditVehicleModal