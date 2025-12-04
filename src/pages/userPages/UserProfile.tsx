import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../dashboardDesign/DashboardLayout'
import { 
User, 
Edit, 
Save, 
X, 
Mail, 
Phone, 
Calendar, 
MapPin, 
Globe, 
Briefcase, 
Link, 
Shield,
Bell,
Eye,
EyeOff,
Upload,
CheckCircle,
AlertCircle,
Building,
Percent
} from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import { 
    UserProfileApi, 
    type UserWithProfile,
    type UpdateProfileRequest,
    type NotificationPreferences,
    profileUtils 
} from '../../features/Api/CustomerUserApi.ts'
import { toast, Toaster } from 'sonner'

const UserProfile: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
    
    // API hooks
    const { 
        data: profileResponse, 
        isLoading, 
        error, 
        refetch 
    } = UserProfileApi.useGetCurrentProfileQuery(undefined, {
        skip: !isAuthenticated
    })
    
    const [updateProfile] = UserProfileApi.useUpdateProfileMutation()
    const [uploadProfilePicture] = UserProfileApi.useUploadProfilePictureMutation()
    const [updateNotificationPrefs] = UserProfileApi.useUpdateNotificationPreferencesMutation()
    const [toggleVisibility] = UserProfileApi.useToggleProfileVisibilityMutation()
    const [validateProfile] = UserProfileApi.useValidateProfileDataMutation()
    
    const { data: completionData } = UserProfileApi.useGetProfileCompletionQuery()

    // States
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'professional' | 'preferences'>('personal')
    const [isUploading, setIsUploading] = useState(false)
    const [showValidationErrors, setShowValidationErrors] = useState(false)
    
    // Form states
    const [formData, setFormData] = useState<UpdateProfileRequest>({})
    const [originalData, setOriginalData] = useState<UpdateProfileRequest>({})
    const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({})
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>('')

    // Current profile data
    const profileData = profileResponse?.data

    // Initialize form data when profile loads
    useEffect(() => {
        if (profileData) {
            const initialFormData = profileUtils.prepareUpdateData(profileData)
            setFormData(initialFormData)
            setOriginalData(initialFormData)
            
            // Set notification preferences
            if (profileData.notification_preferences) {
                setNotificationPrefs(profileUtils.parseNotificationPreferences(profileData.notification_preferences))
            }
            
            // Set image preview if profile picture exists
            if (profileData.profile_picture) {
                setImagePreview(profileData.profile_picture)
            }
        }
    }, [profileData])

    // Handle image upload
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                toast.error('Invalid file type. Please select JPEG, PNG, GIF, or WebP image.')
                return
            }
            
            const maxSize = 5 * 1024 * 1024 // 5MB
            if (file.size > maxSize) {
                toast.error('File size too large. Maximum size is 5MB.')
                return
            }
            
            setProfileImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    // Upload profile picture
    const handleImageUpload = async () => {
        if (!profileImage) return
        
        setIsUploading(true)
        const loadingToastId = toast.loading('Uploading profile picture...')
        
        try {
            const formData = new FormData()
            formData.append('profile_picture', profileImage)
            
            await uploadProfilePicture(formData).unwrap()
            await refetch()
            
            toast.success('Profile picture updated successfully!', { id: loadingToastId })
            setProfileImage(null)
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to upload image', { id: loadingToastId })
        } finally {
            setIsUploading(false)
        }
    }

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        
        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement
            setFormData(prev => ({
                ...prev,
                [name]: checkbox.checked
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    // Handle notification preference changes
    const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
        setNotificationPrefs(prev => ({
            ...prev,
            [key]: value
        }))
    }

    // Validate form before saving
    const validateForm = async (): Promise<boolean> => {
        try {
            const result = await validateProfile(formData).unwrap()
            if (!result.success) {
                setShowValidationErrors(true)
                toast.error('Please fix the validation errors before saving.')
                return false
            }
            return true
        } catch (error) {
            toast.error('Validation failed. Please check your inputs.')
            return false
        }
    }

    // Save profile changes
    const handleSave = async () => {
        if (!profileData?.user_id) return
        
        const isValid = await validateForm()
        if (!isValid) return
        
        const loadingToastId = toast.loading('Saving profile...')
        
        try {
            await updateProfile(formData).unwrap()
            
            // Save notification preferences if changed
            const prefsString = JSON.stringify(notificationPrefs)
            if (prefsString !== profileData.notification_preferences) {
                await updateNotificationPrefs(notificationPrefs)
            }
            
            await refetch()
            setIsEditing(false)
            setShowValidationErrors(false)
            toast.success('Profile updated successfully!', { id: loadingToastId })
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update profile', { id: loadingToastId })
        }
    }

    // Toggle profile visibility
    const handleToggleVisibility = async () => {
        if (!profileData) return
        
        try {
            await toggleVisibility({ is_public: !profileData.is_public }).unwrap()
            await refetch()
            toast.success(`Profile is now ${!profileData.is_public ? 'public' : 'private'}`)
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update visibility')
        }
    }

    // Cancel editing
    const handleCancel = () => {
        setFormData(originalData)
        setIsEditing(false)
        setShowValidationErrors(false)
        setProfileImage(null)
        setImagePreview(profileData?.profile_picture || '')
    }

    // Check if form has changes
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData) || 
                      profileImage !== null ||
                      JSON.stringify(notificationPrefs) !== profileData?.notification_preferences

    // Format date
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

    // Get profile completion progress
    const getCompletionColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500'
        if (percentage >= 50) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    // Tabs configuration
    const tabs = [
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'contact', label: 'Contact', icon: Mail },
        { id: 'professional', label: 'Professional', icon: Briefcase },
        { id: 'preferences', label: 'Preferences', icon: Bell }
    ]

    return (
        <DashboardLayout>
            <Toaster position="top-right" richColors />
            
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
                    </div>
                    
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                            disabled={isLoading}
                        >
                            <Edit size={18} />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!hasChanges || isUploading}
                                className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} />
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your profile...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={24} />
                        <div>
                            <h3 className="text-lg font-semibold text-red-800">Failed to load profile</h3>
                            <p className="text-red-600 mt-1">Please try refreshing the page or contact support.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Content */}
            {!isLoading && !error && profileData && (
                <div className="space-y-6">
                    {/* Profile Completion */}
                    {completionData?.data && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Percent className="text-indigo-600" size={20} />
                                    <h3 className="font-semibold text-gray-900">Profile Completion</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(completionData.data.profile_completion_percentage)} text-white`}>
                                    {completionData.data.profile_completion_percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${getCompletionColor(completionData.data.profile_completion_percentage)}`}
                                    style={{ width: `${completionData.data.profile_completion_percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {completionData.data.completion_level} profile • Updated {formatDate(completionData.data.last_profile_update)}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar - Profile Card */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Profile Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 mx-auto mb-4 relative">
                                        {imagePreview ? (
                                            <img 
                                                src={imagePreview} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="text-indigo-500" size={48} />
                                            </div>
                                        )}
                                        
                                        {isEditing && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
                                                <label className="cursor-pointer p-3 bg-white rounded-full hover:bg-gray-100 transition-colors">
                                                    <Upload size={20} />
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={handleImageSelect}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {isEditing && profileImage && (
                                        <div className="flex gap-2 justify-center mt-3">
                                            <button
                                                onClick={handleImageUpload}
                                                disabled={isUploading}
                                                className="btn btn-sm btn-primary bg-indigo-600 hover:bg-indigo-700 text-white"
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setProfileImage(null)
                                                    setImagePreview(profileData.profile_picture || '')
                                                }}
                                                className="btn btn-sm btn-outline border-gray-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    
                                    <h2 className="text-xl font-bold text-center text-gray-900 mb-1">
                                        {profileUtils.formatFullName(profileData)}
                                    </h2>
                                    {profileData.email && (
                                        <p className="text-gray-600 text-center text-sm mb-4">{profileData.email}</p>
                                    )}
                                    
                                    {/* Profile Visibility Toggle */}
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <button
                                            onClick={handleToggleVisibility}
                                            disabled={!isEditing}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                                profileData.is_public 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            } ${isEditing ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
                                        >
                                            {profileData.is_public ? (
                                                <>
                                                    <Eye size={14} />
                                                    Public
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff size={14} />
                                                    Private
                                                </>
                                            )}
                                        </button>
                                        <div className="relative group">
                                            <Shield size={16} className="text-gray-400" />
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48">
                                                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2">
                                                    {profileData.is_public 
                                                        ? 'Your profile is visible to other users' 
                                                        : 'Only you can see your profile'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Quick Stats */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Member Since</span>
                                            <span className="font-medium">{formatDate(profileData.created_at)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Last Updated</span>
                                            <span className="font-medium">{formatDate(profileData.updated_at)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Updates Count</span>
                                            <span className="font-medium">{profileData.profile_updated_count}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon size={18} />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                {/* Tab Content */}
                                <div className="p-6">
                                    {/* Personal Information Tab */}
                                    {activeTab === 'personal' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 mb-6">
                                                <User className="text-indigo-600" size={20} />
                                                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* First Name */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        First Name *
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            name="first_name"
                                                            value={formData.first_name || ''}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="Enter first name"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {profileData.first_name || 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Last Name */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Last Name *
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            name="last_name"
                                                            value={formData.last_name || ''}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="Enter last name"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {profileData.last_name || 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Middle Name */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Middle Name
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            name="middle_name"
                                                            value={formData.middle_name || ''}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="Enter middle name"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {profileData.middle_name || 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Gender */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Gender
                                                    </label>
                                                    {isEditing ? (
                                                        <select
                                                            name="gender"
                                                            value={formData.gender || ''}
                                                            onChange={handleInputChange}
                                                            className="select select-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                        >
                                                            <option value="">Select gender</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {profileData.gender || 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Date of Birth */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <Calendar size={14} className="inline mr-1" />
                                                        Date of Birth
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="date"
                                                            name="date_of_birth"
                                                            value={formData.date_of_birth || ''}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {profileData.date_of_birth ? formatDate(profileData.date_of_birth) : 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Preferred Language */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <Globe size={14} className="inline mr-1" />
                                                        Preferred Language
                                                    </label>
                                                    {isEditing ? (
                                                        <select
                                                            name="preferred_language"
                                                            value={formData.preferred_language || 'en'}
                                                            onChange={handleInputChange}
                                                            className="select select-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                        >
                                                            <option value="en">English</option>
                                                            <option value="es">Spanish</option>
                                                            <option value="fr">French</option>
                                                            <option value="de">German</option>
                                                        </select>
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {profileData.preferred_language?.toUpperCase() || 'EN'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Bio */}
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Bio
                                                    </label>
                                                    {isEditing ? (
                                                        <textarea
                                                            name="bio"
                                                            value={formData.bio || ''}
                                                            onChange={handleInputChange}
                                                            rows={3}
                                                            className="textarea textarea-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="Tell us about yourself..."
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px]">
                                                            {profileData.bio || 'No bio provided'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact Information Tab */}
                                    {activeTab === 'contact' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 mb-6">
                                                <Mail className="text-indigo-600" size={20} />
                                                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                {/* Email (Read-only from auth) */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <Mail size={14} className="inline mr-1" />
                                                        Email Address
                                                    </label>
                                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                                                        <span>{profileData.email || 'Not provided'}</span>
                                                        {profileData.email && (
                                                            <CheckCircle className="text-green-500" size={16} />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Phone */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <Phone size={14} className="inline mr-1" />
                                                        Phone Number
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="tel"
                                                            name="emergency_contact_phone"
                                                            value={formData.emergency_contact_phone || ''}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="Enter phone number"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {profileData.emergency_contact_phone || 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Emergency Contact */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Emergency Contact Name
                                                        </label>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                name="emergency_contact_name"
                                                                value={formData.emergency_contact_name || ''}
                                                                onChange={handleInputChange}
                                                                className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                                placeholder="Enter emergency contact name"
                                                            />
                                                        ) : (
                                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                {profileData.emergency_contact_name || 'Not provided'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Emergency Contact Phone
                                                        </label>
                                                        {isEditing ? (
                                                            <input
                                                                type="tel"
                                                                name="emergency_contact_phone"
                                                                value={formData.emergency_contact_phone || ''}
                                                                onChange={handleInputChange}
                                                                className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                                placeholder="Enter emergency phone"
                                                            />
                                                        ) : (
                                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                {profileData.emergency_contact_phone || 'Not provided'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Address Information */}
                                                <div className="pt-6 border-t border-gray-200">
                                                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                        <MapPin size={16} />
                                                        Address Information
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Address
                                                            </label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    name="address"
                                                                    value={formData.address || ''}
                                                                    onChange={handleInputChange}
                                                                    className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                                    placeholder="Enter your address"
                                                                />
                                                            ) : (
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                    {profileData.address || 'Not provided'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                City
                                                            </label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    name="city"
                                                                    value={formData.city || ''}
                                                                    onChange={handleInputChange}
                                                                    className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                                    placeholder="Enter city"
                                                                />
                                                            ) : (
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                    {profileData.city || 'Not provided'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                State/Province
                                                            </label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    name="state"
                                                                    value={formData.state || ''}
                                                                    onChange={handleInputChange}
                                                                    className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                                    placeholder="Enter state"
                                                                />
                                                            ) : (
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                    {profileData.state || 'Not provided'}
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
                                                                    value={formData.country || ''}
                                                                    onChange={handleInputChange}
                                                                    className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                                    placeholder="Enter country"
                                                                />
                                                            ) : (
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                    {profileData.country || 'Not provided'}
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
                                                                    value={formData.postal_code || ''}
                                                                    onChange={handleInputChange}
                                                                    className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                                    placeholder="Enter postal code"
                                                                />
                                                            ) : (
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                    {profileData.postal_code || 'Not provided'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Professional Information Tab */}
                                    {activeTab === 'professional' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 mb-6">
                                                <Briefcase className="text-indigo-600" size={20} />
                                                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Company */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <Building size={14} className="inline mr-1" />
                                                        Company
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            name="company"
                                                            value={formData.company || ''}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="Enter company name"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {profileData.company || 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Job Title */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Job Title
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            name="job_title"
                                                            value={formData.job_title || ''}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="Enter job title"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {profileData.job_title || 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Website */}
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <Link size={14} className="inline mr-1" />
                                                        Website
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="url"
                                                            name="website"
                                                            value={formData.website || ''}
                                                            onChange={handleInputChange}
                                                            className="input input-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="https://example.com"
                                                        />
                                                    ) : (
                                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            {profileData.website ? (
                                                                <a 
                                                                    href={profileData.website} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-indigo-600 hover:underline"
                                                                >
                                                                    {profileData.website}
                                                                </a>
                                                            ) : 'Not provided'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Additional Information */}
                                                <div className="md:col-span-2">
                                                    <h4 className="text-md font-semibold text-gray-900 mb-4">Additional Information</h4>
                                                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                                        <p className="text-sm text-gray-600">
                                                            This information helps us provide you with a better experience. 
                                                            Fill in as much as you're comfortable sharing.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Preferences Tab */}
                                    {activeTab === 'preferences' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 mb-6">
                                                <Bell className="text-indigo-600" size={20} />
                                                <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                {/* Notification Preferences */}
                                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                                                    <h4 className="text-md font-semibold text-gray-900 mb-4">Notification Preferences</h4>
                                                    <div className="space-y-3">
                                                        {([
                                                            { key: 'email' as const, label: 'Email Notifications', description: 'Receive updates via email' },
                                                            { key: 'sms' as const, label: 'SMS Notifications', description: 'Receive text message alerts' },
                                                            { key: 'push' as const, label: 'Push Notifications', description: 'Get browser/app notifications' },
                                                            { key: 'marketing' as const, label: 'Marketing Communications', description: 'Receive promotional emails' },
                                                            { key: 'updates' as const, label: 'System Updates', description: 'Get important system updates' },
                                                        ]).map(({ key, label, description }) => (
                                                            <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                                                <div>
                                                                    <label className="font-medium text-gray-900">{label}</label>
                                                                    <p className="text-sm text-gray-600">{description}</p>
                                                                </div>
                                                                {isEditing ? (
                                                                    <label className="switch">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={notificationPrefs[key] || false}
                                                                            onChange={(e) => handleNotificationChange(key, e.target.checked)}
                                                                        />
                                                                        <span className="slider round"></span>
                                                                    </label>
                                                                ) : (
                                                                    <div className={`px-3 py-1 rounded-full text-sm ${notificationPrefs[key] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                        {notificationPrefs[key] ? 'Enabled' : 'Disabled'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Privacy Preferences */}
                                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                                                    <h4 className="text-md font-semibold text-gray-900 mb-4">Privacy Settings</h4>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <label className="font-medium text-gray-900">Profile Visibility</label>
                                                                <p className="text-sm text-gray-600">
                                                                    {profileData.is_public 
                                                                        ? 'Your profile is visible to other users' 
                                                                        : 'Only you can see your profile'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isEditing ? (
                                                                    <button
                                                                        onClick={handleToggleVisibility}
                                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                                            profileData.is_public 
                                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                                        }`}
                                                                    >
                                                                        {profileData.is_public ? 'Public' : 'Private'}
                                                                    </button>
                                                                ) : (
                                                                    <span className={`px-4 py-2 rounded-lg font-medium ${
                                                                        profileData.is_public 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {profileData.is_public ? 'Public' : 'Private'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <label className="font-medium text-gray-900">Data Sharing</label>
                                                                <p className="text-sm text-gray-600">Allow data collection for personalization</p>
                                                            </div>
                                                            {isEditing ? (
                                                                <label className="switch">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="data_sharing"
                                                                        checked={formData.is_public || false}
                                                                        onChange={() => {}}
                                                                    />
                                                                    <span className="slider round"></span>
                                                                </label>
                                                            ) : (
                                                                <span className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-800">
                                                                    {formData.is_public ? 'Enabled' : 'Disabled'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Validation Errors */}
                                    {showValidationErrors && (
                                        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="text-red-500" size={18} />
                                                <h4 className="font-medium text-red-800">Please fix the following errors:</h4>
                                            </div>
                                            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                                <li>First name is required</li>
                                                <li>Last name is required</li>
                                                <li>Email must be valid</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add custom switch styles - FIXED JSX ATTRIBUTE */}
            <style jsx="true">{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                }
                input:checked + .slider {
                    background-color: #4f46e5;
                }
                input:checked + .slider:before {
                    transform: translateX(26px);
                }
                .slider.round {
                    border-radius: 34px;
                }
                .slider.round:before {
                    border-radius: 50%;
                }
            `}</style>
        </DashboardLayout>
    )
}

export default UserProfile