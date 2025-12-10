// components/admin/CreateVehicleModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Car, Camera, Check, Save, ChevronRight, ChevronLeft, AlertCircle, DollarSign, MapPin, Gauge, Shield, Wrench, Calendar, Tag, FileText, Sparkles, PlusCircle, Info, Clock, Cloud } from 'lucide-react'
import { VehicleApi } from '../../../features/Api/VehicleApi'
import Swal from 'sweetalert2'
import { type CreateVehicleRequest, type AddVehicleImageRequest, type VehicleResponse, type CarModel } from '../../../types/vehicletype'

interface CreateVehicleModalProps {
    onClose: () => void
    onSuccess: () => void
}

interface CreateVehicleResponse {
    message: string;
    vehicle: VehicleResponse;
}

interface CloudinaryUploadResult {
    url: string;
    type: string;
    publicId: string;
}

const CreateVehicleModal: React.FC<CreateVehicleModalProps> = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1)
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploadingImages, setIsUploadingImages] = useState(false)
    const [uploadedImageUrls, setUploadedImageUrls] = useState<CloudinaryUploadResult[]>([])
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

    // Cloudinary configuration
    const CLOUDINARY_CLOUD_NAME = 'dfhzcvbof'
    const CLOUDINARY_UPLOAD_PRESET = 'Csrrentalsystem'
    const CLOUDINARY_FOLDER = 'currentalsystem/vehicles'

    // Auto-set default dates
    useEffect(() => {
        const today = new Date()
        const nextYear = new Date()
        nextYear.setFullYear(today.getFullYear() + 1)
        const nextMonth = new Date()
        nextMonth.setMonth(today.getMonth() + 1)

        setFormData(prev => ({
            ...prev,
            insurance_expiry_date: prev.insurance_expiry_date || nextYear.toISOString().split('T')[0],
            service_due_date: prev.service_due_date || nextMonth.toISOString().split('T')[0]
        }))
    }, [])

    const validateStep = (stepNumber: number): boolean => {
        const errors: Record<string, string> = {}

        if (stepNumber === 1) {
            if (!formData.model_id || formData.model_id <= 0) errors.model_id = 'Please select a valid model'
            if (!formData.registration_number.trim()) errors.registration_number = 'Registration number is required'
            if (!formData.color.trim()) errors.color = 'Color is required'
            if (!formData.vin_number.trim()) errors.vin_number = 'VIN number is required'
            if (!formData.current_mileage || formData.current_mileage < 0) errors.current_mileage = 'Valid mileage is required'
            
            if (formData.vin_number && formData.vin_number.length !== 17) {
                errors.vin_number = 'VIN must be exactly 17 characters'
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
        
        if (name === 'model_id' || name === 'current_mileage') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? 0 : Number(value)
            }))
        } else if (name === 'branch_id' || name === 'actual_daily_rate') {
            // For optional fields, convert empty string to undefined
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? undefined : Number(value)
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
        
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
            if (file.size > 5 * 1024 * 1024) {
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
        
        // Create previews for new images only
        validFiles.forEach(file => {
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target?.result as string])
            }
            reader.readAsDataURL(file)
        })

        if (formErrors.images) {
            setFormErrors(prev => ({ ...prev, images: '' }))
        }
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        const newPreviews = imagePreviews.filter((_, i) => i !== index)
        const newUploadedUrls = uploadedImageUrls.filter((_, i) => i !== index)
        setImages(newImages)
        setImagePreviews(newPreviews)
        setUploadedImageUrls(newUploadedUrls)
        if (primaryImageIndex === index) {
            setPrimaryImageIndex(0)
        } else if (primaryImageIndex > index) {
            setPrimaryImageIndex(primaryImageIndex - 1)
        }
    }

    const uploadImageToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
        formData.append('folder', CLOUDINARY_FOLDER)
        formData.append('tags', 'currentalsystem,vehicle')

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            )

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Upload failed (${response.status}): ${errorText}`)
            }

            const data = await response.json()
            
            return {
                url: data.secure_url,
                type: data.format,
                publicId: data.public_id
            }
        } catch (error) {
            console.error('Cloudinary upload error:', error)
            throw error
        }
    }

    const uploadImagesToCloudinary = async (): Promise<CloudinaryUploadResult[]> => {
        if (images.length === 0) return []

        setIsUploadingImages(true)
        
        Swal.fire({
            title: 'Uploading Images...',
            html: `
                <div class="text-center">
                    <div class="mb-4">
                        <div class="radial-progress text-primary mx-auto" style="--value:0; width: 60px; height: 60px;">0%</div>
                    </div>
                    <p class="text-sm text-gray-600">Uploading to Cloudinary...</p>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false
        })

        try {
            const uploadedUrls: CloudinaryUploadResult[] = []
            
            for (let i = 0; i < images.length; i++) {
                try {
                    const progress = Math.round(((i + 1) / images.length) * 100)
                    
                    // Update progress in Swal
                    const progressElement = document.querySelector('.radial-progress') as HTMLElement
                    if (progressElement) {
                        progressElement.style.setProperty('--value', progress.toString())
                        progressElement.textContent = `${progress}%`
                    }

                    const result = await uploadImageToCloudinary(images[i])
                    uploadedUrls.push(result)
                } catch (error: any) {
                    console.error(`Failed to upload image ${i + 1}:`, error)
                    throw new Error(`Failed to upload image ${i + 1}. Please try again.`)
                }
            }

            setUploadedImageUrls(uploadedUrls)
            Swal.close()
            return uploadedUrls
        } catch (error: any) {
            Swal.close()
            Swal.fire({
                title: 'Upload Failed',
                text: error.message || 'Failed to upload images. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            })
            throw error
        } finally {
            setIsUploadingImages(false)
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
        
        if (!validateStep(3)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please fix all errors before submitting',
                icon: 'error',
                confirmButtonText: 'OK'
            })
            return
        }

        setIsSubmitting(true)
        
        try {
            console.log('Starting vehicle creation process...')
            
            // Step 1: Create vehicle first
            const vehicleData: CreateVehicleRequest = {
                model_id: Number(formData.model_id),
                registration_number: formData.registration_number.trim(),
                color: formData.color.trim(),
                vin_number: formData.vin_number.trim(),
                current_mileage: Number(formData.current_mileage),
                branch_id: formData.branch_id,
                actual_daily_rate: formData.actual_daily_rate,
                insurance_expiry_date: formData.insurance_expiry_date || undefined,
                service_due_date: formData.service_due_date || undefined,
                custom_features: formData.custom_features?.trim() || undefined,
                notes: formData.notes?.trim() || undefined
            }
            
            console.log('Creating vehicle with data:', vehicleData)
            
            const vehicleResponse = await createVehicle(vehicleData).unwrap() as CreateVehicleResponse
            console.log('Vehicle created successfully:', vehicleResponse)
            
            // Extract vehicle_id from response
            let vehicleId: number;
            
            // Check the response structure based on your backend
            if (vehicleResponse.vehicle && vehicleResponse.vehicle.vehicle_id) {
                // Structure: { message: "...", vehicle: { vehicle_id: ... } }
                vehicleId = vehicleResponse.vehicle.vehicle_id;
                console.log('Found vehicle_id in response.vehicle:', vehicleId);
            } else if ((vehicleResponse as any).vehicle_id) {
                // Structure: { vehicle_id: ..., ... } (direct response)
                vehicleId = (vehicleResponse as any).vehicle_id;
                console.log('Found vehicle_id directly in response:', vehicleId);
            } else {
                console.error('Could not extract vehicle_id from response:', vehicleResponse);
                throw new Error('Could not retrieve vehicle ID from server response');
            }

            console.log('Vehicle ID:', vehicleId);

            // Step 2: Upload images to Cloudinary if any
            let imageUploadResults: CloudinaryUploadResult[] = []
            if (images.length > 0) {
                console.log('Uploading', images.length, 'images to Cloudinary...')
                try {
                    imageUploadResults = await uploadImagesToCloudinary()
                    console.log('Cloudinary upload successful:', imageUploadResults)
                } catch (error: any) {
                    // Even if image upload fails, we still have the vehicle created
                    console.warn('Cloudinary upload failed, but vehicle was created:', error)
                    // Continue without images
                }
            }

            // Step 3: Add image records to backend
            if (imageUploadResults.length > 0) {
                console.log('Adding', imageUploadResults.length, 'images to vehicle...')
                
                try {
                    // Show uploading progress
                    Swal.fire({
                        title: 'Saving Images...',
                        text: 'Please wait while image information is being saved',
                        icon: 'info',
                        showConfirmButton: false,
                        allowOutsideClick: false
                    })

                    const uploadPromises = imageUploadResults.map(async (imageData, index) => {
                        const imageRequest: AddVehicleImageRequest = {
                            image_url: imageData.url,
                            image_type: getImageTypeFromCloudinaryType(imageData.type) || 'exterior',
                            is_primary: index === primaryImageIndex,
                            display_order: index + 1,
                            cloudinary_public_id: imageData.publicId
                        }
                        
                        console.log(`Adding image ${index + 1} to vehicle ${vehicleId}:`, imageRequest);
                        
                        try {
                            // Use the RTK Query endpoint
                            return await addVehicleImage({ 
                                vehicle_id: vehicleId, 
                                image: imageRequest 
                            }).unwrap();
                        } catch (error: any) {
                            console.error(`Failed to add image ${index + 1}:`, error);
                            
                            // If the endpoint doesn't exist or fails, skip this image
                            console.warn(`Skipping image ${index + 1} due to error:`, error.message);
                            return null;
                        }
                    });
                    
                    const results = await Promise.all(uploadPromises);
                    const successfulUploads = results.filter(result => result !== null).length;
                    
                    Swal.close();
                    console.log(`${successfulUploads}/${imageUploadResults.length} images saved successfully`);
                    
                } catch (imageError: any) {
                    console.warn('Error adding images to database, but vehicle was created:', imageError);
                    Swal.close();
                }
            }

            // Success message
            const successMessage = images.length > 0 
                ? `Vehicle created successfully! ${imageUploadResults.length} image(s) uploaded.`
                : 'Vehicle created successfully!';

            Swal.fire({
                title: 'Success!',
                html: `
                    <div class="text-center">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Vehicle Created!</h3>
                        <p class="text-gray-600">
                            ${formData.registration_number} has been added to the system.
                        </p>
                        ${imageUploadResults.length > 0 ? 
                            `<p class="text-sm text-green-600 mt-2">
                                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                ${imageUploadResults.length} image(s) uploaded
                            </p>` : ''
                        }
                    </div>
                `,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                onSuccess();
                onClose();
            })
            
        } catch (error: any) {
            console.error('Submit error details:', {
                error,
                status: error?.status,
                data: error?.data,
                message: error?.message
            })
            
            let errorMessage = 'Failed to create vehicle.';
            
            if (error?.status === 409) {
                errorMessage = error?.data?.error || 'Registration number or VIN already exists.';
            } else if (error?.status === 400) {
                errorMessage = error?.data?.error || 'Invalid data provided. Please check your inputs.';
            } else if (error?.status === 404) {
                errorMessage = 'Car model or branch not found.';
            } else if (error?.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error?.data?.error) {
                errorMessage = error.data.error;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            })
        } finally {
            setIsSubmitting(false);
        }
    }

    const getImageTypeFromCloudinaryType = (format: string): string => {
        return 'exterior'
    }

    const groupedModels = carModels?.reduce((acc: Record<string, CarModel[]>, model) => {
        if (!acc[model.make]) acc[model.make] = []
        acc[model.make].push(model)
        return acc
    }, {})

    const selectedModel = carModels?.find(model => model.model_id === formData.model_id)
    const selectedBranch = branches?.find(branch => branch.branch_id === formData.branch_id)

    const getDailyRate = (): number | string => {
        if (formData.actual_daily_rate !== undefined) return formData.actual_daily_rate
        if (selectedModel && 'standard_daily_rate' in selectedModel) {
            return selectedModel.standard_daily_rate
        }
        return 'Standard rate'
    }

    const formatDailyRate = (rate: number | string): string => {
        if (typeof rate === 'number') {
            return rate.toFixed(2)
        }
        return rate
    }

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

    // Format date for display
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden my-8">
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
                            className="btn btn-ghost btn-circle text-white hover:bg-white/20 transition-colors"
                            title="Close"
                            disabled={isSubmitting || isUploadingImages}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

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
                                        disabled={isSubmitting || isUploadingImages}
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
                        {step === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Model Selection */}
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
                                            disabled={isLoadingModels}
                                        >
                                            <option value="0">Select Model</option>
                                            {isLoadingModels ? (
                                                <option disabled>Loading models...</option>
                                            ) : groupedModels && Object.entries(groupedModels).map(([make, models]) => (
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

                                    {/* Registration Number */}
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
                                            disabled={isSubmitting}
                                        />
                                        {formErrors.registration_number && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{formErrors.registration_number}</span>
                                            </label>
                                        )}
                                    </div>

                                    {/* Color */}
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
                                            disabled={isSubmitting}
                                        />
                                        {formErrors.color && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{formErrors.color}</span>
                                            </label>
                                        )}
                                    </div>

                                    {/* VIN Number */}
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
                                            className={`input input-bordered input-lg focus:ring-2 focus:ring-emerald-500 uppercase ${
                                                formErrors.vin_number ? 'border-red-500' : ''
                                            }`}
                                            required
                                            placeholder="17-character VIN"
                                            maxLength={17}
                                            disabled={isSubmitting}
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

                                    {/* Current Mileage */}
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
                                            step="1"
                                            placeholder="0"
                                            disabled={isSubmitting}
                                        />
                                        {formErrors.current_mileage && (
                                            <label className="label">
                                                <span className="label-text-alt text-red-500">{formErrors.current_mileage}</span>
                                            </label>
                                        )}
                                    </div>

                                    {/* Daily Rate */}
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
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <label className="label">
                                            <span className="label-text-alt text-gray-500">
                                                Leave empty to use model's standard rate
                                            </span>
                                        </label>
                                    </div>

                                    {/* Branch Selection */}
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
                                            disabled={isLoadingBranches || isSubmitting}
                                        >
                                            <option value="">Select Branch (Optional)</option>
                                            {isLoadingBranches ? (
                                                <option disabled>Loading branches...</option>
                                            ) : branches?.map(branch => (
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

                                {/* Insurance and Service Sections */}
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
                                                    disabled={isSubmitting}
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
                                                    disabled={isSubmitting}
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

                                {/* Custom Features and Notes */}
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
                                            disabled={isSubmitting}
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
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-200 p-6">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Camera className="w-10 h-10 text-purple-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Vehicle Images</h3>
                                        <p className="text-gray-600 mb-4">
                                            Add high-quality images to showcase your vehicle. Images will be uploaded to Cloudinary.
                                        </p>
                                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg mb-4">
                                            <Cloud className="w-4 h-4" />
                                            <span className="text-sm">Using Cloudinary for image storage</span>
                                        </div>
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
                                            disabled={images.length >= 10 || isUploadingImages || isSubmitting}
                                        />
                                        <p className="text-sm text-gray-400 mt-4">
                                            {images.length}/10 images selected
                                        </p>
                                        {formErrors.images && (
                                            <p className="text-red-500 text-sm mt-2">{formErrors.images}</p>
                                        )}
                                        {isUploadingImages && (
                                            <p className="text-blue-600 text-sm mt-2">
                                                <span className="loading loading-spinner loading-xs mr-2"></span>
                                                Uploading images to Cloudinary...
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <ImageIcon className="w-5 h-5" />
                                            Preview Images ({imagePreviews.length})
                                            {primaryImageIndex >= 0 && (
                                                <span className="text-sm font-normal text-emerald-600">
                                                    • Primary: Image {primaryImageIndex + 1}
                                                </span>
                                            )}
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <div className={`aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-colors ${
                                                        primaryImageIndex === index 
                                                            ? 'border-emerald-500' 
                                                            : 'border-transparent group-hover:border-primary'
                                                    }`}>
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
                                                                disabled={isUploadingImages || isSubmitting}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="flex justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPrimaryImageIndex(index)}
                                                                disabled={isUploadingImages || isSubmitting}
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
                            </div>
                        )}

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
                                                    <dd className="font-mono font-medium text-gray-800 text-sm">{formData.vin_number}</dd>
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

                                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <DollarSign className="w-5 h-5" />
                                                Pricing & Location
                                            </h4>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <dt className="text-gray-600">Daily Rate:</dt>
                                                    <dd className="font-bold text-emerald-600">
                                                        ${formatDailyRate(getDailyRate())}
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
                                                        {formatDate(formData.insurance_expiry_date)}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                    <dt className="text-gray-600">Service Due:</dt>
                                                    <dd className="font-medium text-gray-800">
                                                        {formatDate(formData.service_due_date)}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>

                                    {imagePreviews.length > 0 && (
                                        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
                                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <Camera className="w-5 h-5" />
                                                Images ({imagePreviews.length})
                                            </h4>
                                            <div className="flex gap-3 overflow-x-auto pb-2">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative flex-shrink-0">
                                                        <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                                                            index === primaryImageIndex 
                                                                ? 'border-emerald-500' 
                                                                : 'border-gray-300'
                                                        }`}>
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
                                                        <div className="absolute bottom-1 right-1">
                                                            <span className="badge badge-xs bg-black/70 text-white">
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-3">
                                                {primaryImageIndex >= 0 && (
                                                    <span className="text-emerald-600 mr-3">
                                                        <Check className="w-4 h-4 inline mr-1" />
                                                        Image {primaryImageIndex + 1} is primary
                                                    </span>
                                                )}
                                                <span>
                                                    Images will be uploaded to Cloudinary during submission
                                                </span>
                                            </p>
                                        </div>
                                    )}

                                    {(formData.custom_features || formData.notes) && (
                                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {formData.custom_features && (
                                                <div className="bg-white rounded-lg border border-gray-200 p-5">
                                                    <h4 className="font-semibold text-gray-800 mb-3">Custom Features</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.custom_features.split(',').filter(f => f.trim()).map((feature, index) => (
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
                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

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
                                    Step {step} of 3 • Images uploaded to Cloudinary
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={step > 1 ? handlePrevStep : onClose}
                                    className="btn btn-ghost gap-2"
                                    disabled={isSubmitting || isUploadingImages}
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
                                        disabled={isUploadingImages || isSubmitting}
                                    >
                                        Continue
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="btn btn-success gap-2 min-w-[140px]"
                                        disabled={isSubmitting || isCreating || isUploadingImages}
                                    >
                                        {isSubmitting || isCreating || isUploadingImages ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                {isUploadingImages ? 'Uploading...' : 'Creating...'}
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