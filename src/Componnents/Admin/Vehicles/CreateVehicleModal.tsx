// components/admin/CreateVehicleModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Car, Camera, Check, Save, ChevronRight, ChevronLeft, AlertCircle, DollarSign, MapPin, Gauge, Shield, Wrench, Calendar, Tag, FileText, Sparkles, PlusCircle, Info, Clock } from 'lucide-react'
import { VehicleApi } from '../../../features/Api/VehicleApi'
import Swal from 'sweetalert2'
import { type CreateVehicleRequest, type AddVehicleImageRequest } from '../../../types/vehicletype'

interface CreateVehicleModalProps {
    onClose: () => void
    onSuccess: () => void
}

const CreateVehicleModal: React.FC<CreateVehicleModalProps> = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1)
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // RTK Query hooks
    const { data: carModels, isLoading: isLoadingModels } = VehicleApi.useGetAllCarModelsQuery()
    const { data: branches, isLoading: isLoadingBranches } = VehicleApi.useGetAllBranchesQuery()
    const [createVehicle, { isLoading: isCreating }] = VehicleApi.useCreateVehicleMutation()
    const [addVehicleImage, { isLoading: isAddingImage }] = VehicleApi.useAddVehicleImageMutation()

    const [formData, setFormData] = useState<CreateVehicleRequest>({
        model_id: 0,
        registration_number: '',
        color: '',
        vin_number: '',
        current_mileage: 0,
        branch_id: undefined,
        insurance_expiry_date: '',
        service_due_date: '',
        actual_daily_rate: undefined,
        custom_features: '',
        notes: ''
    })

    // Auto-set default dates
    useEffect(() => {
        const today = new Date()
        const nextYear = new Date(today.setFullYear(today.getFullYear() + 1))
            .toISOString()
            .split('T')[0]
        const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split('T')[0]

        setFormData(prev => ({
            ...prev,
            insurance_expiry_date: prev.insurance_expiry_date || nextYear,
            service_due_date: prev.service_due_date || nextMonth
        }))
    }, [])

    const validateStep = (stepNumber: number): boolean => {
        const errors: Record<string, string> = {}

        if (stepNumber === 1) {
            if (!formData.model_id) errors.model_id = 'Model is required'
            if (!formData.registration_number) errors.registration_number = 'Registration number is required'
            if (!formData.color) errors.color = 'Color is required'
            if (!formData.vin_number) errors.vin_number = 'VIN number is required'
            if (!formData.current_mileage || formData.current_mileage < 0) errors.current_mileage = 'Valid mileage is required'
            
            // Validate VIN format (basic validation)
            if (formData.vin_number && formData.vin_number.length !== 17) {
                errors.vin_number = 'VIN must be 17 characters'
            }
        }

        if (stepNumber === 2) {
            if (images.length === 0) errors.images = 'At least one image is recommended'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'model_id' || name === 'current_mileage' || name === 'branch_id' || name === 'actual_daily_rate' 
                ? value ? Number(value) : undefined 
                : value
        }))
        
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        
        if (files.length + images.length > 10) {
            Swal.fire({
                title: 'Too many images',
                text: 'You can upload up to 10 images maximum',
                icon: 'warning',
                confirmButtonText: 'OK'
            })
            return
        }

        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    title: 'Invalid file',
                    text: 'Please upload image files only',
                    icon: 'error',
                    confirmButtonText: 'OK'
                })
                return false
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                Swal.fire({
                    title: 'File too large',
                    text: 'Maximum file size is 5MB',
                    icon: 'error',
                    confirmButtonText: 'OK'
                })
                return false
            }
            return true
        })

        const newImages = [...images, ...validFiles]
        setImages(newImages)
        
        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target?.result as string])
            }
            reader.readAsDataURL(file)
        })

        // Clear image error
        if (formErrors.images) {
            setFormErrors(prev => ({ ...prev, images: '' }))
        }
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        const newPreviews = imagePreviews.filter((_, i) => i !== index)
        setImages(newImages)
        setImagePreviews(newPreviews)
        if (primaryImageIndex === index) {
            setPrimaryImageIndex(0)
        } else if (primaryImageIndex > index) {
            setPrimaryImageIndex(primaryImageIndex - 1)
        }
    }

    const handleNextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1)
        } else {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please fix the errors before proceeding',
                icon: 'error',
                confirmButtonText: 'OK'
            })
        }
    }

    const handlePrevStep = () => {
        setStep(step - 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        if (!validateStep(3)) {
            setIsSubmitting(false)
            return
        }

        try {
            // Create vehicle
            const vehicle = await createVehicle(formData).unwrap()
            
            // Upload images if any
            if (images.length > 0) {
                Swal.fire({
                    title: 'Uploading Images...',
                    text: 'Please wait while images are being uploaded',
                    icon: 'info',
                    showConfirmButton: false,
                    allowOutsideClick: false
                })

                const uploadPromises = images.map(async (file, index) => {
                    const imageData: AddVehicleImageRequest = {
                        image_url: URL.createObjectURL(file), // In production, upload to cloud storage
                        image_type: file.type,
                        is_primary: index === primaryImageIndex,
                        display_order: index
                    }
                    return await addVehicleImage({ vehicle_id: vehicle.vehicle_id, image: imageData }).unwrap()
                })
                
                await Promise.all(uploadPromises)
                Swal.close()
            }

            Swal.fire({
                title: 'Success!',
                text: 'Vehicle created successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                onSuccess()
            })
            
        } catch (error: any) {
            Swal.fire({
                title: 'Error!',
                text: error?.data?.message || 'Failed to create vehicle.',
                icon: 'error',
                confirmButtonText: 'OK'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const groupedModels = carModels?.reduce((acc, model) => {
        if (!acc[model.make]) acc[model.make] = []
        acc[model.make].push(model)
        return acc
    }, {} as Record<string, any[]>)

    // Get selected model details
    const selectedModel = carModels?.find(model => model.model_id === formData.model_id)
    const selectedBranch = branches?.find(branch => branch.branch_id === formData.branch_id)

    const getStepIcon = (stepNumber: number) => {
        switch(stepNumber) {
            case 1: return <Car className="w-5 h-5" />
            case 2: return <Camera className="w-5 h-5" />
            case 3: return <Check className="w-5 h-5" />
            default: return <Car className="w-5 h-5" />
        }
    }

    const getStepTitle = (stepNumber: number) => {
        switch(stepNumber) {
            case 1: return 'Vehicle Details'
            case 2: return 'Upload Images'
            case 3: return 'Review & Create'
            default: return 'Step'
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden my-8">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <PlusCircle className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    Add New Vehicle
                                </h2>
                                <p className="text-sm opacity-90 mt-1">
                                    Step {step} of 3: {getStepTitle(step)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-circle text-white hover:bg-white/20"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            {[1, 2, 3].map((stepNum) => (
                                <div key={stepNum} className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => stepNum < step && setStep(stepNum)}
                                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                            step >= stepNum 
                                                ? 'bg-white text-emerald-700 shadow-lg' 
                                                : 'bg-white/20 text-white'
                                        } ${stepNum < step ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                                    >
                                        {step > stepNum ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            getStepIcon(stepNum)
                                        )}
                                    </button>
                                    {stepNum < 3 && (
                                        <div className={`w-24 h-1 mx-4 transition-all ${
                                            step > stepNum ? 'bg-white' : 'bg-white/30'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between max-w-2xl mx-auto mt-3 text-sm">
                            {[1, 2, 3].map((stepNum) => (
                                <span key={stepNum} className={`transition-all ${
                                    step >= stepNum ? 'text-white font-medium' : 'text-white/70'
                                }`}>
                                    {getStepTitle(stepNum)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <Car className="w-4 h-4" />
                                                Model *
                                            </span>
                                        </label>
                                        <select 
                                            name="model_id"
                                            value={formData.model_id}
                                            onChange={handleInputChange}
                                            className={`select select-bordered select-lg focus:ring-2 focus:ring-emerald-500 ${
                                                formErrors.model_id ? 'border-red-500' : ''
                                            }`}
                                            required
                                        >
                                            <option value="">Select Model</option>
                                            {groupedModels && Object.entries(groupedModels).map(([make, models]) => (
                                                <optgroup key={make} label={make}>
                                                    {models.map(model => (
                                                        <option key={model.model_id} value={model.model_id}>
                                                            {model.model} {model.year} • {model.vehicle_type}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        {formErrors.model_id && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{formErrors.model_id}</span>
                                            </label>
                                        )}
                                    </div>

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
                                            className={`input input-bordered input-lg focus:ring-2 focus:ring-emerald-500 ${
                                                formErrors.registration_number ? 'border-red-500' : ''
                                            }`}
                                            required
                                            placeholder="ABC-123"
                                        />
                                        {formErrors.registration_number && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{formErrors.registration_number}</span>
                                            </label>
                                        )}
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
                                            className={`input input-bordered input-lg focus:ring-2 focus:ring-emerald-500 ${
                                                formErrors.color ? 'border-red-500' : ''
                                            }`}
                                            required
                                            placeholder="e.g., Red, Blue, Black"
                                        />
                                        {formErrors.color && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{formErrors.color}</span>
                                            </label>
                                        )}
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
                                            className={`input input-bordered input-lg focus:ring-2 focus:ring-emerald-500 ${
                                                formErrors.vin_number ? 'border-red-500' : ''
                                            }`}
                                            required
                                            placeholder="17-character VIN"
                                            maxLength={17}
                                        />
                                        {formErrors.vin_number && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{formErrors.vin_number}</span>
                                            </label>
                                        )}
                                        <div className="label">
                                            <span className="label-text-alt text-gray-500">
                                                {formData.vin_number.length}/17 characters
                                            </span>
                                        </div>
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
                                            className={`input input-bordered input-lg focus:ring-2 focus:ring-emerald-500 ${
                                                formErrors.current_mileage ? 'border-red-500' : ''
                                            }`}
                                            required
                                            min="0"
                                            placeholder="0"
                                        />
                                        {formErrors.current_mileage && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{formErrors.current_mileage}</span>
                                            </label>
                                        )}
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
                                                className="input input-bordered input-lg pl-8 focus:ring-2 focus:ring-emerald-500"
                                                placeholder="Override standard rate"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <label className="label">
                                            <span className="label-text-alt text-gray-500">
                                                Leave empty to use model's standard rate
                                            </span>
                                        </label>
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
                                            className="select select-bordered select-lg focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="">Select Branch (Optional)</option>
                                            {branches?.map(branch => (
                                                <option key={branch.branch_id} value={branch.branch_id}>
                                                    {branch.branch_name} • {branch.city}
                                                </option>
                                            ))}
                                        </select>
                                        <label className="label">
                                            <span className="label-text-alt text-gray-500">
                                                Can be assigned later
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Maintenance Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Shield className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Insurance Information</h4>
                                                <p className="text-sm text-gray-600">Set insurance expiry date</p>
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
                                            <label className="label">
                                                <span className="label-text-alt text-gray-500">
                                                    Auto-set to 1 year from today
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-200 p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                <Wrench className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Service Information</h4>
                                                <p className="text-sm text-gray-600">Set next service due date</p>
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
                                                    className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                            <label className="label">
                                                <span className="label-text-alt text-gray-500">
                                                    Auto-set to 1 month from today
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Features & Notes */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                Custom Features
                                            </span>
                                        </label>
                                        <textarea
                                            name="custom_features"
                                            value={formData.custom_features}
                                            onChange={handleInputChange}
                                            className="textarea textarea-bordered h-32 focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Enter custom features separated by commas...
                                            Example: Leather Seats, Sunroof, Navigation System, Heated Seats"
                                            rows={4}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                Notes
                                            </span>
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            className="textarea textarea-bordered h-32 focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Additional notes, remarks, or special instructions...
                                            Example: Brand new vehicle, Special handling required"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Images */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-200 p-6">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Camera className="w-10 h-10 text-purple-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Vehicle Images</h3>
                                        <p className="text-gray-600 mb-4">
                                            Add high-quality images to showcase your vehicle. First image will be primary.
                                        </p>
                                    </div>

                                    <div className="border-3 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors bg-gradient-to-br from-gray-50 to-white">
                                        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Drag & Drop or Click to Upload</h4>
                                        <p className="text-gray-500 mb-4">
                                            Upload up to 10 images (JPG, PNG, WEBP) • Max 5MB per image
                                        </p>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                                            disabled={images.length >= 10}
                                        />
                                        <p className="text-sm text-gray-400 mt-4">
                                            {images.length}/10 images selected
                                        </p>
                                        {formErrors.images && (
                                            <p className="text-red-500 text-sm mt-2">{formErrors.images}</p>
                                        )}
                                    </div>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <ImageIcon className="w-5 h-5" />
                                            Preview Images ({imagePreviews.length})
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent group-hover:border-primary transition-colors">
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-3">
                                                        <div className="self-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="btn btn-error btn-circle btn-xs text-white"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="flex justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPrimaryImageIndex(index)}
                                                                className={`btn btn-xs ${
                                                                    primaryImageIndex === index 
                                                                        ? 'btn-primary' 
                                                                        : 'btn-ghost text-white'
                                                                }`}
                                                            >
                                                                {primaryImageIndex === index ? 'Primary' : 'Set Primary'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {primaryImageIndex === index && (
                                                        <div className="absolute top-2 left-2">
                                                            <span className="badge badge-primary badge-sm shadow-lg">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Primary
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-2 right-2">
                                                        <span className="badge badge-outline badge-xs text-white bg-black/50">
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Image Tips */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Info className="w-5 h-5" />
                                        Image Upload Tips
                                    </h4>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-500" />
                                            Use high-resolution images (minimum 1200x800 pixels)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-500" />
                                            Include exterior, interior, and engine shots
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-500" />
                                            Good lighting and clear backgrounds work best
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-500" />
                                            First image will be used as the primary display image
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 p-6">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check className="w-8 h-8 text-emerald-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Review Vehicle Details</h3>
                                        <p className="text-gray-600">
                                            Please review all information before creating the vehicle
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Basic Information */}
                                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <Car className="w-5 h-5" />
                                                Basic Information
                                            </h4>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <dt className="text-gray-600">Registration:</dt>
                                                    <dd className="font-medium text-gray-800">{formData.registration_number}</dd>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <dt className="text-gray-600">VIN:</dt>
                                                    <dd className="font-mono font-medium text-gray-800">{formData.vin_number}</dd>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <dt className="text-gray-600">Color:</dt>
                                                    <dd className="font-medium text-gray-800">{formData.color}</dd>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <dt className="text-gray-600">Mileage:</dt>
                                                    <dd className="font-medium text-gray-800">{formData.current_mileage.toLocaleString()} km</dd>
                                                </div>
                                                {selectedModel && (
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <dt className="text-gray-600">Model:</dt>
                                                        <dd className="font-medium text-gray-800">
                                                            {selectedModel.make} {selectedModel.model} {selectedModel.year}
                                                        </dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </div>

                                        {/* Pricing & Location */}
                                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <DollarSign className="w-5 h-5" />
                                                Pricing & Location
                                            </h4>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <dt className="text-gray-600">Daily Rate:</dt>
                                                    <dd className="font-bold text-emerald-600">
                                                        ${formData.actual_daily_rate || selectedModel?.daily_rate || 'Standard rate'}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <dt className="text-gray-600">Branch:</dt>
                                                    <dd className="font-medium text-gray-800">
                                                        {selectedBranch?.branch_name || 'Unassigned'}
                                                        {selectedBranch?.city && (
                                                            <span className="text-gray-500 text-sm ml-2">
                                                                ({selectedBranch.city})
                                                            </span>
                                                        )}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <dt className="text-gray-600">Insurance Expiry:</dt>
                                                    <dd className="font-medium text-gray-800">
                                                        {formData.insurance_expiry_date ? 
                                                            new Date(formData.insurance_expiry_date).toLocaleDateString() : 
                                                            'Not set'
                                                        }
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <dt className="text-gray-600">Service Due:</dt>
                                                    <dd className="font-medium text-gray-800">
                                                        {formData.service_due_date ? 
                                                            new Date(formData.service_due_date).toLocaleDateString() : 
                                                            'Not set'
                                                        }
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>

                                    {/* Images Preview */}
                                    {imagePreviews.length > 0 && (
                                        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
                                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <Camera className="w-5 h-5" />
                                                Images ({imagePreviews.length})
                                            </h4>
                                            <div className="flex gap-3 overflow-x-auto pb-2">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative flex-shrink-0">
                                                        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent">
                                                            <img
                                                                src={preview}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        {index === primaryImageIndex && (
                                                            <div className="absolute -top-1 -right-1">
                                                                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Features & Notes */}
                                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {formData.custom_features && (
                                            <div className="bg-white rounded-lg border border-gray-200 p-5">
                                                <h4 className="font-semibold text-gray-800 mb-3">Custom Features</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.custom_features.split(',').map((feature, index) => (
                                                        <span key={index} className="badge badge-outline badge-sm">
                                                            {feature.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {formData.notes && (
                                            <div className="bg-white rounded-lg border border-gray-200 p-5">
                                                <h4 className="font-semibold text-gray-800 mb-3">Notes</h4>
                                                <p className="text-sm text-gray-700 line-clamp-3">{formData.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Final Check */}
                                    <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-5">
                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                                            Final Check
                                        </h4>
                                        <ul className="text-sm text-gray-600 space-y-2">
                                            <li className="flex items-center gap-2">
                                                {formData.model_id ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <X className="w-4 h-4 text-red-500" />
                                                )}
                                                <span>Model selected</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                {formData.registration_number ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <X className="w-4 h-4 text-red-500" />
                                                )}
                                                <span>Registration number provided</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                {imagePreviews.length > 0 ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                                                )}
                                                <span>Images uploaded (recommended)</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                <span>Vehicle will be created with status: <strong>Available</strong></span>
                                            </li>
                                        </ul>
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
                                    <span className="font-medium">Creating new vehicle</span>
                                    {selectedModel && (
                                        <span className="text-emerald-600">
                                            • {selectedModel.make} {selectedModel.model}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Step {step} of 3 • All required fields marked with *
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={step > 1 ? handlePrevStep : onClose}
                                    className="btn btn-ghost gap-2"
                                    disabled={isSubmitting}
                                >
                                    {step > 1 ? (
                                        <>
                                            <ChevronLeft className="w-4 h-4" />
                                            Back
                                        </>
                                    ) : (
                                        'Cancel'
                                    )}
                                </button>
                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="btn btn-primary gap-2"
                                    >
                                        Continue
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="btn btn-success gap-2 min-w-[140px]"
                                        disabled={isSubmitting || isCreating}
                                    >
                                        {isSubmitting || isCreating ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Create Vehicle
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateVehicleModal