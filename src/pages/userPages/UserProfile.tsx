import React, { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../../dashboardDesign/DashboardLayout'
import { User, Edit, Save, X, Mail, Phone, Calendar, Shield, Check, MapPin, Globe, Briefcase, Heart, Bell, Lock, Unlock, Camera, Upload } from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import { UserProfileApi, profileUtils } from '../../features/Api/CustomerUserApi'
import { toast, Toaster } from 'sonner'
import { skipToken } from '@reduxjs/toolkit/query'

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dfhzcvbof'
const CLOUDINARY_UPLOAD_PRESET = 'Csrrentalsystem'
const CLOUDINARY_FOLDER = 'currentalsystem/profiles' // Changed from vehicles to profiles

const UserProfile: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
    const [isEditing, setIsEditing] = useState(false)
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    // Use the correct endpoint - get profile by user_id
    const { data: profileResponse, isLoading: isLoadingProfile, refetch } = UserProfileApi.useGetProfileByUserIdQuery(
        user?.user_id ? user.user_id : skipToken
    )
    
    const [updateProfile, { isLoading: isUpdating }] = UserProfileApi.useUpdateProfileByUserIdMutation()
    const [uploadProfilePicture, { isLoading: isUploading }] = UserProfileApi.useUploadProfilePictureMutation()
    
    // Get profile data from response
    const profileData = profileResponse?.data
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        bio: '',
        website: '',
        company: '',
        job_title: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        preferred_language: 'en',
        is_public: true
    })
    
    const [originalData, setOriginalData] = useState({ ...formData })

    // Initialize form data when profile data is available
    useEffect(() => {
        if (profileData) {
            const userInfo = {
                first_name: profileData.first_name || '',
                last_name: profileData.last_name || '',
                middle_name: profileData.middle_name || '',
                email: profileData.email || '',
                phone_number: profileData.phone_number || '',
                date_of_birth: profileData.date_of_birth || '',
                gender: profileData.gender || '',
                address: profileData.address || '',
                city: profileData.city || '',
                state: profileData.state || '',
                country: profileData.country || '',
                postal_code: profileData.postal_code || '',
                bio: profileData.bio || '',
                website: profileData.website || '',
                company: profileData.company || '',
                job_title: profileData.job_title || '',
                emergency_contact_name: profileData.emergency_contact_name || '',
                emergency_contact_phone: profileData.emergency_contact_phone || '',
                preferred_language: profileData.preferred_language || 'en',
                is_public: profileData.is_public || true
            }
            setFormData(userInfo)
            setOriginalData(userInfo)
        }
    }, [profileData])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }))
    }

    // Function to handle profile picture upload to Cloudinary
    const handleProfilePictureUpload = async (file: File) => {
        if (!user?.user_id) {
            toast.error("User ID not found")
            return
        }

        setIsUploadingPhoto(true)
        setUploadProgress(0)
        const loadingToastId = toast.loading("Uploading profile picture...")

        try {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP')
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024 // 5MB
            if (file.size > maxSize) {
                throw new Error('File too large. Maximum size is 5MB')
            }

            // Create form data for Cloudinary upload
            const cloudinaryFormData = new FormData()
            cloudinaryFormData.append('file', file)
            cloudinaryFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
            cloudinaryFormData.append('folder', CLOUDINARY_FOLDER)
            cloudinaryFormData.append('public_id', `profile_${user.user_id}_${Date.now()}`)

            // Upload to Cloudinary
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

            const xhr = new XMLHttpRequest()
            
            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100)
                    setUploadProgress(progress)
                    toast.loading(`Uploading... ${progress}%`, { id: loadingToastId })
                }
            })

            const cloudinaryResponse = await new Promise<any>((resolve, reject) => {
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try {
                                const response = JSON.parse(xhr.responseText)
                                resolve(response)
                            } catch (error) {
                                reject(new Error('Failed to parse Cloudinary response'))
                            }
                        } else {
                            reject(new Error('Upload failed'))
                        }
                    }
                }
                xhr.onerror = () => reject(new Error('Network error'))
                xhr.open('POST', cloudinaryUrl, true)
                xhr.send(cloudinaryFormData)
            })

            // Get the secure URL from Cloudinary response
            const imageUrl = cloudinaryResponse.secure_url

            // Update profile with the new image URL using your API
            await uploadProfilePicture({
                user_id: user.user_id,
                file: file // This will be used by your backend
            }).unwrap()

            // Alternatively, you can update the profile picture directly
            // Uncomment this if your backend doesn't handle profile picture uploads
            /*
            await updateProfile({
                target_user_id: user.user_id,
                profile_picture: imageUrl
            }).unwrap()
            */

            // Refresh profile data
            refetch()
            toast.success("Profile picture uploaded successfully!", { id: loadingToastId })
        } catch (error: any) {
            console.error('Profile picture upload failed:', error)
            const errorMessage = error?.message || 'Failed to upload profile picture. Please try again.'
            toast.error(errorMessage, { id: loadingToastId })
        } finally {
            setIsUploadingPhoto(false)
            setUploadProgress(0)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleProfilePictureUpload(file)
        }
    }

    // Trigger file input click
    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleSave = async () => {
        if (!user?.user_id) {
            toast.error("User ID not found")
            return
        }

        const loadingToastId = toast.loading("Updating profile...")

        try {
            // Prepare update data - only changed fields
            const updateData: any = {}
            Object.keys(formData).forEach(key => {
                if (key === 'user_id' || key === 'email' || key === 'phone_number') return // Don't send these
                const value = formData[key as keyof typeof formData]
                const originalValue = originalData[key as keyof typeof originalData]
                
                // Only include if value has changed and is not null/undefined
                if (value !== originalValue && value !== undefined && value !== null) {
                    updateData[key] = value === '' ? null : value
                }
            })

            // Validate data before sending
            const validation = profileUtils.validateProfile(updateData)
            if (!validation.isValid) {
                toast.error(`Validation failed: ${validation.errors.join(', ')}`, { id: loadingToastId })
                return
            }

            // Send update request
            await updateProfile({
                target_user_id: user.user_id,
                ...updateData
            }).unwrap()

            setOriginalData(formData)
            setIsEditing(false)
            refetch() // Refresh profile data
            toast.success("Profile updated successfully!", { id: loadingToastId })
        } catch (error: any) {
            console.error('Profile update failed:', error)
            const errorMessage = error?.data?.error || 
                               error?.data?.details?.[0] || 
                               error?.data?.message || 
                               'Failed to update profile. Please try again.'
            toast.error(errorMessage, { id: loadingToastId })
        }
    }

    const handleCancel = () => {
        setFormData(originalData)
        setIsEditing(false)
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return 'Invalid date'
        }
    }

    const calculateProfileCompletion = () => {
        if (!profileData) return 0
        return profileUtils.calculateCompletion(profileData)
    }

    const getProfileStatus = () => {
        if (!profileData) return { label: 'Basic', color: 'bg-blue-100 text-blue-800' }
        const status = profileUtils.getProfileStatus(profileData)
        const colorMap = {
            'Private': 'bg-gray-100 text-gray-800',
            'Complete': 'bg-green-100 text-green-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Basic': 'bg-blue-100 text-blue-800'
        }
        return { label: status.label, color: colorMap[status.label as keyof typeof colorMap] || 'bg-blue-100 text-blue-800' }
    }

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)

    // Parse notification preferences
    const notificationPrefs = profileUtils.parseNotificationPreferences(profileData?.notification_preferences || null)

    // Format date for date input
    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return ''
        try {
            const date = new Date(dateString)
            return date.toISOString().split('T')[0]
        } catch {
            return ''
        }
    }

    // Get profile picture URL or use default
    const getProfilePictureUrl = () => {
        if (profileData?.profile_picture) {
            return profileData.profile_picture
        }
        return '/default-avatar.png' // Make sure this image exists in your public folder
    }

    return (
        <DashboardLayout>
            <Toaster position="top-right" richColors />
            
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploadingPhoto}
            />
            
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <User className="text-green-600" size={24} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User Profile</h1>
                </div>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-outline border-green-800 text-green-800 hover:bg-green-800 hover:text-white"
                    >
                        <Edit size={16} />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="btn btn-outline btn-error"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || isUpdating}
                            className="btn bg-green-800 hover:bg-green-900 text-white"
                        >
                            {isUpdating ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <Save size={16} />
                            )}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {!isAuthenticated || !user ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
                    <p className="text-red-600">Please sign in to view your profile.</p>
                </div>
            ) : isLoadingProfile ? (
                <div className="flex justify-center items-center py-16">
                    <span className="loading loading-spinner loading-lg text-green-600">Loading ....</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Profile Picture Section */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-green-100 border-4 border-white shadow-lg">
                                    {isUploadingPhoto ? (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <div className="text-center">
                                                <div className="loading loading-spinner loading-md text-green-600"></div>
                                                <p className="text-xs text-gray-500 mt-2">{uploadProgress}%</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <img 
                                            src={getProfilePictureUrl()} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/default-avatar.png'
                                            }}
                                        />
                                    )}
                                </div>
                                
                                {/* Upload Overlay Button */}
                                <button
                                    onClick={triggerFileInput}
                                    disabled={isUploadingPhoto}
                                    className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Change profile picture"
                                >
                                    {isUploadingPhoto ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                        <Camera size={18} />
                                    )}
                                </button>
                                
                                {/* Upload Button (Always visible on mobile) */}
                                <div className="md:hidden mt-3">
                                    <button
                                        onClick={triggerFileInput}
                                        disabled={isUploadingPhoto}
                                        className="btn btn-sm btn-outline border-green-600 text-green-600 hover:bg-green-600 hover:text-white w-full"
                                    >
                                        {isUploadingPhoto ? (
                                            <>
                                                <span className="loading loading-spinner loading-xs mr-2"></span>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={14} className="mr-2" />
                                                Change Photo
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {profileUtils.formatFullName(profileData || {})}
                                        </h2>
                                        <p className="text-gray-600 mt-1">{profileData?.email || user.email}</p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getProfileStatus().color}`}>
                                                {getProfileStatus().label}
                                            </span>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                                                <Shield size={14} className="mr-1" />
                                                {user.role?.toUpperCase() || 'USER'}
                                            </span>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                                {profileData?.is_public ? (
                                                    <>
                                                        <Unlock size={14} className="mr-1" />
                                                        Public
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={14} className="mr-1" />
                                                        Private
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-green-600">
                                                {calculateProfileCompletion()}%
                                            </div>
                                            <div className="text-sm text-gray-600">Profile Completion</div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                                <div 
                                                    className="bg-green-600 h-2.5 rounded-full" 
                                                    style={{ width: `${calculateProfileCompletion()}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Personal Information */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6">Personal Information</h3>

                                <div className="space-y-6">
                                    {/* Name Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={formData.first_name}
                                                    onChange={handleInputChange}
                                                    className="input input-bordered w-full focus:border-green-500"
                                                    placeholder="Enter your first name"
                                                />
                                            ) : (
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    {profileData?.first_name || 'Not provided'}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Middle Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="middle_name"
                                                    value={formData.middle_name}
                                                    onChange={handleInputChange}
                                                    className="input input-bordered w-full focus:border-green-500"
                                                    placeholder="Enter your middle name"
                                                />
                                            ) : (
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    {profileData?.middle_name || 'Not provided'}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={formData.last_name}
                                                    onChange={handleInputChange}
                                                    className="input input-bordered w-full focus:border-green-500"
                                                    placeholder="Enter your last name"
                                                />
                                            ) : (
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    {profileData?.last_name || 'Not provided'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Mail size={18} />
                                            Contact Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email Address
                                                </label>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    {profileData?.email || user.email || 'Not provided'}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone Number
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="tel"
                                                        name="phone_number"
                                                        value={formData.phone_number}
                                                        onChange={handleInputChange}
                                                        className="input input-bordered w-full focus:border-green-500"
                                                        placeholder="Enter your phone number"
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        {profileData?.phone_number || 'Not provided'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Details */}
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-800 mb-4">Personal Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Date of Birth
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        name="date_of_birth"
                                                        value={formatDateForInput(formData.date_of_birth)}
                                                        onChange={handleInputChange}
                                                        className="input input-bordered w-full focus:border-green-500"
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        {formatDate(profileData?.date_of_birth || null)}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Gender
                                                </label>
                                                {isEditing ? (
                                                    <select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleInputChange}
                                                        className="select select-bordered w-full focus:border-green-500"
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        {profileData?.gender || 'Not provided'}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Preferred Language
                                                </label>
                                                {isEditing ? (
                                                    <select
                                                        name="preferred_language"
                                                        value={formData.preferred_language}
                                                        onChange={handleInputChange}
                                                        className="select select-bordered w-full focus:border-green-500"
                                                    >
                                                        <option value="en">English</option>
                                                        <option value="es">Spanish</option>
                                                        <option value="fr">French</option>
                                                        <option value="de">German</option>
                                                        <option value="zh">Chinese</option>
                                                    </select>
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        {profileData?.preferred_language || 'English'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <MapPin size={18} />
                                            Address Information
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Address
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        className="input input-bordered w-full focus:border-green-500"
                                                        placeholder="Enter your address"
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        {profileData?.address || 'Not provided'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        City
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            value={formData.city}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-green-500"
                                                            placeholder="City"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            {profileData?.city || 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        State
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            name="state"
                                                            value={formData.state}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-green-500"
                                                            placeholder="State"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            {profileData?.state || 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Country
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            name="country"
                                                            value={formData.country}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-green-500"
                                                            placeholder="Country"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            {profileData?.country || 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Postal Code
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            name="postal_code"
                                                            value={formData.postal_code}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-green-500"
                                                            placeholder="Postal Code"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            {profileData?.postal_code || 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Professional Information */}
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Briefcase size={18} />
                                            Professional Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Company
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="company"
                                                        value={formData.company}
                                                        onChange={handleInputChange}
                                                        className="input input-bordered w-full focus:border-green-500"
                                                        placeholder="Enter your company name"
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        {profileData?.company || 'Not provided'}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Job Title
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="job_title"
                                                        value={formData.job_title}
                                                        onChange={handleInputChange}
                                                        className="input input-bordered w-full focus:border-green-500"
                                                        placeholder="Enter your job title"
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        {profileData?.job_title || 'Not provided'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bio
                                            </label>
                                            {isEditing ? (
                                                <textarea
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    className="textarea textarea-bordered w-full focus:border-green-500"
                                                    placeholder="Tell us about yourself..."
                                                    rows={3}
                                                />
                                            ) : (
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    {profileData?.bio || 'No bio provided'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <Globe size={16} />
                                                Website
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="url"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleInputChange}
                                                    className="input input-bordered w-full focus:border-green-500"
                                                    placeholder="https://example.com"
                                                />
                                            ) : (
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    {profileData?.website ? (
                                                        <a 
                                                            href={profileData.website} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {profileData.website}
                                                        </a>
                                                    ) : 'Not provided'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Information */}
                        <div className="space-y-6">
                            {/* Emergency Contact */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Heart size={18} />
                                    Emergency Contact
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="emergency_contact_name"
                                                value={formData.emergency_contact_name}
                                                onChange={handleInputChange}
                                                className="input input-bordered w-full focus:border-green-500"
                                                placeholder="Enter emergency contact name"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                {profileData?.emergency_contact_name || 'Not provided'}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Phone
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="emergency_contact_phone"
                                                value={formData.emergency_contact_phone}
                                                onChange={handleInputChange}
                                                className="input input-bordered w-full focus:border-green-500"
                                                placeholder="Enter emergency contact phone"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                {profileData?.emergency_contact_phone || 'Not provided'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Calendar size={14} className="inline mr-1" />
                                            Member Since
                                        </label>
                                        <div className="p-2 bg-gray-50 rounded">
                                            {profileData?.created_at ? formatDate(profileData.created_at) : 'Unknown'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Profile Update
                                        </label>
                                        <div className="p-2 bg-gray-50 rounded">
                                            {profileData?.last_profile_update ? formatDate(profileData.last_profile_update) : 'Never'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            User ID
                                        </label>
                                        <div className="p-2 bg-gray-50 rounded font-mono text-sm">
                                            #{user?.user_id}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Profile Updates
                                        </label>
                                        <div className="p-2 bg-gray-50 rounded">
                                            {profileData?.profile_updated_count || 0} times
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Profile Visibility
                                                </label>
                                                <input
                                                    type="checkbox"
                                                    name="is_public"
                                                    checked={formData.is_public}
                                                    onChange={handleCheckboxChange}
                                                    className="toggle toggle-success"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {formData.is_public 
                                                    ? 'Your profile is visible to other users' 
                                                    : 'Your profile is private and only visible to you'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notification Preferences */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Bell size={18} />
                                    Notifications
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Email Notifications</span>
                                        <div className={`px-2 py-1 rounded text-xs ${notificationPrefs.email ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {notificationPrefs.email ? 'Enabled' : 'Disabled'}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Push Notifications</span>
                                        <div className={`px-2 py-1 rounded text-xs ${notificationPrefs.push ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {notificationPrefs.push ? 'Enabled' : 'Disabled'}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Marketing Emails</span>
                                        <div className={`px-2 py-1 rounded text-xs ${notificationPrefs.marketing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {notificationPrefs.marketing ? 'Enabled' : 'Disabled'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Stats */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">
                            <Check className="inline mr-2" size={20} />
                            Profile Statistics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {calculateProfileCompletion()}%
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Completion</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {profileUtils.getCompletionLevel(calculateProfileCompletion())}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Profile Level</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {profileData?.profile_updated_count || 0}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Updates Made</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {profileData?.is_public ? 'Public' : 'Private'}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Profile Status</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default UserProfile