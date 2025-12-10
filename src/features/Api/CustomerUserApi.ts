import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain'
import { type ApiResponse } from '../../types/CustomerTypes'

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dfhzcvbof'
const CLOUDINARY_UPLOAD_PRESET = 'Csrrentalsystem'
const CLOUDINARY_FOLDER = 'currentalsystem/profiles'

// User Profile interface matching your backend schema
interface UserProfile {
    profile_id: number;
    user_id: number;
    first_name: string | null;
    last_name: string | null;
    middle_name: string | null;
    date_of_birth: string | null;
    gender: 'Male' | 'Female' | 'Other' | null;
    profile_picture: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
    bio: string | null;
    website: string | null;
    company: string | null;
    job_title: string | null;
    preferred_language: string;
    notification_preferences: string | null;
    profile_completion_percentage: number;
    last_profile_update: string;
    profile_updated_count: number;
    is_public: boolean;
    full_name: string;
    created_at: string;
    updated_at: string;
}

interface UserWithProfile extends UserProfile {
    email?: string;
    phone_number?: string;
    username?: string;
    role?: string;
}

interface UpdateProfileRequest {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    date_of_birth?: string;
    gender?: 'Male' | 'Female' | 'Other';
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    bio?: string;
    website?: string;
    company?: string;
    job_title?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    preferred_language?: string;
    notification_preferences?: string;
    is_public?: boolean;
    profile_picture?: string;
}

interface PublicProfile {
    user_id: number;
    first_name: string | null;
    last_name: string | null;
    profile_picture: string | null;
    bio: string | null;
    company: string | null;
    job_title: string | null;
    website: string | null;
    is_public: boolean;
    username: string;
}

interface ProfileCompletion {
    profile_completion_percentage: number;
    last_profile_update: string;
    profile_updated_count: number;
    completion_level: 'Basic' | 'Intermediate' | 'Complete';
}

interface NotificationPreferences {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    marketing?: boolean;
    updates?: boolean;
}

interface ValidationResponse {
    success: boolean;
    errors: string[];
    message: string;
}

interface CloudinaryUploadResponse {
    asset_id: string;
    public_id: string;
    version: number;
    version_id: string;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    folder: string;
    access_mode: string;
    original_filename: string;
}

// Helper function to handle errors
const handleApiError = (error: any) => {
    console.error('API Error:', error);
    return { error: error.data?.error || error.data?.message || 'An error occurred' };
};

export const UserProfileApi = createApi({
    reducerPath: 'userProfileApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${apiDomain}`,
        prepareHeaders: (headers) => {
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Profile', 'PublicProfile', 'ProfileCompletion'],
    endpoints: (builder) => ({
        // Get current user's profile
        getCurrentProfile: builder.query<ApiResponse<UserWithProfile>, number>({
            query: (user_id) => `/profile/${user_id}`,
            providesTags: (result, error, user_id) => [
                { type: 'Profile', id: user_id }
            ],
        }),

        // Get profile completion status
        getProfileCompletion: builder.query<ApiResponse<ProfileCompletion>, number>({
            query: (user_id) => `/profile/me/completion?user_id=${user_id}`,
            providesTags: ['ProfileCompletion'],
        }),

        // Update current user's profile
        updateProfile: builder.mutation<ApiResponse<UserProfile>, { user_id: number } & UpdateProfileRequest>({
            query: ({ user_id, ...updates }) => ({
                url: `/profile/${user_id}`,
                method: 'PATCH',
                body: updates,
            }),
            invalidatesTags: (result, error, { user_id }) => [
                { type: 'Profile', id: user_id }
            ],
        }),

        // Upload profile picture to Cloudinary and update backend
        uploadProfilePicture: builder.mutation<ApiResponse<{ profile_picture: string; profile_completion: number }>, { 
            user_id: number; 
            file: File;
            onProgress?: (progress: number) => void 
        }>({
            queryFn: async ({ user_id, file, onProgress }, api, extraOptions, baseQuery) => {
                try {
                    // Upload to Cloudinary first
                    const cloudinaryFormData = new FormData()
                    cloudinaryFormData.append('file', file)
                    cloudinaryFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
                    cloudinaryFormData.append('folder', CLOUDINARY_FOLDER)
                    cloudinaryFormData.append('public_id', `profile_${user_id}_${Date.now()}`)

                    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

                    // Create XMLHttpRequest to track progress
                    const xhr = new XMLHttpRequest()
                    
                    const cloudinaryPromise = new Promise<CloudinaryUploadResponse>((resolve, reject) => {
                        xhr.upload.addEventListener('progress', (event) => {
                            if (event.lengthComputable && onProgress) {
                                const progress = Math.round((event.loaded / event.total) * 100)
                                onProgress(progress)
                            }
                        })

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
                                    reject(new Error(`Cloudinary upload failed: ${xhr.status}`))
                                }
                            }
                        }
                        xhr.onerror = () => reject(new Error('Network error during Cloudinary upload'))
                        xhr.open('POST', cloudinaryUrl, true)
                        xhr.send(cloudinaryFormData)
                    })

                    // Wait for Cloudinary upload to complete
                    const cloudinaryResponse = await cloudinaryPromise
                    
                    // Update backend with the Cloudinary URL
                    const updateResult = await baseQuery({
                        url: '/me/profile-picture',
                        method: 'POST',
                        body: {
                            user_id,
                            image_url: cloudinaryResponse.secure_url
                        }
                    })

                    if (updateResult.error) {
                        throw updateResult.error
                    }

                    return updateResult as { data: ApiResponse<{ profile_picture: string; profile_completion: number }> }

                } catch (error: any) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error.message || 'Failed to upload profile picture'
                        }
                    }
                }
            },
            invalidatesTags: (result, error, { user_id }) => [
                { type: 'Profile', id: user_id }
            ],
        }),

        // Remove profile picture
        removeProfilePicture: builder.mutation<ApiResponse<{ profile_picture: null; profile_completion: number }>, number>({
            query: (user_id) => ({
                url: '/profile/me/profile-picture',
                method: 'DELETE',
                body: { user_id },
            }),
            invalidatesTags: (result, error, user_id) => [
                { type: 'Profile', id: user_id }
            ],
        }),

        // Update notification preferences
        updateNotificationPreferences: builder.mutation<ApiResponse<{ notification_preferences: NotificationPreferences; profile_completion: number }>, { user_id: number } & NotificationPreferences>({
            query: ({ user_id, ...preferences }) => ({
                url: '/profile/me/notifications',
                method: 'PATCH',
                body: { user_id, ...preferences },
            }),
            invalidatesTags: (result, error, { user_id }) => [
                { type: 'Profile', id: user_id }
            ],
        }),

        // Validate profile data
        validateProfileData: builder.mutation<ValidationResponse, UpdateProfileRequest>({
            query: (profileData) => ({
                url: '/profile/validate',
                method: 'POST',
                body: profileData,
            }),
        }),

        // Get public profile by user_id
        getPublicProfile: builder.query<ApiResponse<PublicProfile>, number>({
            query: (user_id) => `/profile/public/${user_id}`,
            providesTags: (result, error, user_id) => [
                { type: 'PublicProfile', id: user_id }
            ],
        }),

        // Get user profile by user_id
        getProfileByUserId: builder.query<ApiResponse<UserWithProfile>, number>({
            query: (user_id) => `/profile/${user_id}`,
            providesTags: (result, error, user_id) => [
                { type: 'Profile', id: user_id }
            ],
        }),

        // Update user profile by user_id
        updateProfileByUserId: builder.mutation<ApiResponse<UserProfile>, { target_user_id: number } & UpdateProfileRequest>({
            query: ({ target_user_id, ...updates }) => ({
                url: `/profile/${target_user_id}`,
                method: 'PATCH',
                body: updates,
            }),
            invalidatesTags: (result, error, { target_user_id }) => [
                { type: 'Profile', id: target_user_id }
            ],
        }),

        // Toggle profile visibility
        toggleProfileVisibility: builder.mutation<ApiResponse<{ is_public: boolean }>, { user_id: number; is_public: boolean }>({
            query: ({ user_id, is_public }) => ({
                url: '/profile/me/visibility',
                method: 'PATCH',
                body: { user_id, is_public },
            }),
            invalidatesTags: (result, error, { user_id }) => [
                { type: 'Profile', id: user_id }
            ],
        }),

        // Delete profile
        deleteProfile: builder.mutation<ApiResponse<{ message: string }>, number>({
            query: (user_id) => ({
                url: `/profile/${user_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, user_id) => [
                { type: 'Profile', id: user_id }
            ],
        }),

        // Get all profiles - Admin search
        getAllProfiles: builder.query<ApiResponse<UserWithProfile[]>, { 
            search?: string; 
            page?: number; 
            limit?: number 
        }>({
            query: ({ search = '', page = 1, limit = 50 }) => {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (page) params.append('page', page.toString());
                if (limit) params.append('limit', limit.toString());
                
                return `/profile/admin/search?${params.toString()}`;
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ profile_id }) => ({ type: 'Profile' as const, id: profile_id })),
                        { type: 'Profile', id: 'LIST' },
                    ]
                    : [{ type: 'Profile', id: 'LIST' }],
        }),

        // Get all profiles - Alternative endpoint
        getAllProfilesAlt: builder.query<ApiResponse<UserWithProfile[]>, { 
            search?: string; 
            page?: number; 
            limit?: number 
        }>({
            query: ({ search = '', page = 1, limit = 50 }) => {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (page) params.append('page', page.toString());
                if (limit) params.append('limit', limit.toString());
                
                return `/profile/getuserprofile/memi?${params.toString()}`;
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ profile_id }) => ({ type: 'Profile' as const, id: profile_id })),
                        { type: 'Profile', id: 'LIST' },
                    ]
                    : [{ type: 'Profile', id: 'LIST' }],
        }),

        // Get profile by profile_id
        getProfileById: builder.query<ApiResponse<UserWithProfile>, number>({
            query: (profile_id) => `/profile/profile/${profile_id}`,
            providesTags: (result, error, profile_id) => [
                { type: 'Profile', id: profile_id }
            ],
        }),

        // Search profiles
        searchProfiles: builder.query<ApiResponse<UserWithProfile[]>, { 
            q: string; 
            limit?: number; 
            offset?: number 
        }>({
            query: ({ q, limit = 50, offset = 0 }) => 
                `/profile/admin/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`,
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ profile_id }) => ({ type: 'Profile' as const, id: profile_id })),
                        { type: 'Profile', id: 'SEARCH' },
                    ]
                    : [{ type: 'Profile', id: 'SEARCH' }],
        }),

        // Direct Cloudinary upload helper (for manual upload if needed)
        uploadToCloudinary: builder.mutation<CloudinaryUploadResponse, File>({
            queryFn: async (file, api, extraOptions, baseQuery) => {
                try {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
                    formData.append('folder', CLOUDINARY_FOLDER)

                    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                        method: 'POST',
                        body: formData,
                    })

                    if (!response.ok) {
                        throw new Error(`Cloudinary upload failed: ${response.statusText}`)
                    }

                    const data = await response.json()
                    return { data }
                } catch (error: any) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            data: error.message || 'Failed to upload to Cloudinary'
                        }
                    }
                }
            },
        }),
    }),
})

// Export hooks for usage in components
export const {
    // Current user endpoints
    useGetCurrentProfileQuery,
    useLazyGetCurrentProfileQuery,
    useUpdateProfileMutation,
    useUploadProfilePictureMutation,
    useRemoveProfilePictureMutation,
    useGetProfileCompletionQuery,
    useLazyGetProfileCompletionQuery,
    useValidateProfileDataMutation,
    useUpdateNotificationPreferencesMutation,
    useToggleProfileVisibilityMutation,

    // Public endpoints
    useGetPublicProfileQuery,
    useLazyGetPublicProfileQuery,

    // User-specific endpoints
    useGetProfileByUserIdQuery,
    useLazyGetProfileByUserIdQuery,
    useUpdateProfileByUserIdMutation,
    useDeleteProfileMutation,

    // Admin endpoints
    useGetAllProfilesQuery,
    useLazyGetAllProfilesQuery,
    useGetAllProfilesAltQuery,
    useLazyGetAllProfilesAltQuery,
    useSearchProfilesQuery,
    useLazySearchProfilesQuery,
    useGetProfileByIdQuery,
    useLazyGetProfileByIdQuery,

    // Cloudinary helper
    useUploadToCloudinaryMutation,

    // Debug/alternative endpoints
    useTestEndpointQuery,
    useLazyTestEndpointQuery,
} = UserProfileApi

// Helper hooks for common operations
export const userProfileApi = UserProfileApi

// Utility functions for working with profiles
export const profileUtils = {
    // Calculate profile completion percentage (frontend version)
    calculateCompletion: (profile: Partial<UserProfile>): number => {
        if (!profile) return 0;
        
        let completion = 0;
        
        // Basic info (30%)
        if (profile.first_name) completion += 10;
        if (profile.last_name) completion += 10;
        if (profile.date_of_birth) completion += 5;
        if (profile.gender) completion += 5;
        
        // Contact info (30%)
        if (profile.address) completion += 15;
        if (profile.city && profile.country) completion += 15;
        
        // Profile enhancement (40%)
        if (profile.profile_picture) completion += 20;
        if (profile.bio) completion += 10;
        if (profile.emergency_contact_name) completion += 5;
        if (profile.emergency_contact_phone) completion += 5;
        
        return Math.min(completion, 100);
    },

    // Format full name
    formatFullName: (profile: Partial<UserProfile>): string => {
        if (!profile) return 'Unknown User';
        
        if (profile.first_name && profile.last_name) {
            return `${profile.first_name} ${profile.last_name}`;
        }
        if (profile.first_name) {
            return profile.first_name;
        }
        if (profile.last_name) {
            return profile.last_name;
        }
        return 'Unknown User';
    },

    // Parse notification preferences
    parseNotificationPreferences: (preferencesJson: string | null): NotificationPreferences => {
        if (!preferencesJson) {
            return {
                email: true,
                sms: false,
                push: true,
                marketing: false,
                updates: true,
            };
        }
        
        try {
            return JSON.parse(preferencesJson);
        } catch (error) {
            console.error('Error parsing notification preferences:', error);
            return {
                email: true,
                sms: false,
                push: true,
                marketing: false,
                updates: true,
            };
        }
    },

    // Stringify notification preferences
    stringifyNotificationPreferences: (preferences: NotificationPreferences): string => {
        return JSON.stringify(preferences);
    },

    // Prepare profile update data
    prepareUpdateData: (profile: Partial<UserProfile>): UpdateProfileRequest => {
        return {
            first_name: profile.first_name || undefined,
            last_name: profile.last_name || undefined,
            middle_name: profile.middle_name || undefined,
            date_of_birth: profile.date_of_birth || undefined,
            gender: profile.gender || undefined,
            address: profile.address || undefined,
            city: profile.city || undefined,
            state: profile.state || undefined,
            country: profile.country || undefined,
            postal_code: profile.postal_code || undefined,
            bio: profile.bio || undefined,
            website: profile.website || undefined,
            company: profile.company || undefined,
            job_title: profile.job_title || undefined,
            emergency_contact_name: profile.emergency_contact_name || undefined,
            emergency_contact_phone: profile.emergency_contact_phone || undefined,
            preferred_language: profile.preferred_language || undefined,
            notification_preferences: profile.notification_preferences || undefined,
            is_public: profile.is_public || undefined,
            profile_picture: profile.profile_picture || undefined,
        };
    },

    // Check if profile is complete (over 80%)
    isProfileComplete: (profile: Partial<UserProfile> | null): boolean => {
        if (!profile) return false;
        const completion = profileUtils.calculateCompletion(profile);
        return completion >= 80;
    },

    // Get profile completion level
    getCompletionLevel: (completion: number): 'Basic' | 'Intermediate' | 'Complete' => {
        if (completion < 30) return 'Basic';
        if (completion < 70) return 'Intermediate';
        return 'Complete';
    },

    // Validate profile data on frontend
    validateProfile: (data: UpdateProfileRequest): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (data.first_name && data.first_name.trim().length < 2) {
            errors.push('First name must be at least 2 characters');
        }

        if (data.last_name && data.last_name.trim().length < 2) {
            errors.push('Last name must be at least 2 characters');
        }

        if (data.date_of_birth) {
            const dob = new Date(data.date_of_birth);
            const today = new Date();
            const minAge = new Date();
            minAge.setFullYear(today.getFullYear() - 18);

            if (dob > today) {
                errors.push('Date of birth cannot be in the future');
            }

            if (dob > minAge) {
                errors.push('User must be at least 18 years old');
            }
        }

        if (data.emergency_contact_phone) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = data.emergency_contact_phone.replace(/[\s\-\(\)]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                errors.push('Invalid phone number format');
            }
        }

        if (data.website && !data.website.startsWith('http')) {
            errors.push('Website must start with http:// or https://');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Get profile picture URL with fallback
    getProfilePicture: (profile: Partial<UserProfile>): string => {
        if (profile?.profile_picture) {
            return profile.profile_picture;
        }
        return '/default-avatar.png'; // You should have a default avatar image
    },

    // Format date for display
    formatDisplayDate: (dateString: string | null): string => {
        if (!dateString) return 'Not set';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    },

    // Get profile status badge
    getProfileStatus: (profile: Partial<UserProfile>): { label: string; color: string } => {
        if (!profile) {
            return { label: 'Basic', color: 'badge-info' };
        }
        
        if (!profile.is_public) {
            return { label: 'Private', color: 'badge-neutral' };
        }
        
        const completion = profileUtils.calculateCompletion(profile);
        if (completion >= 80) {
            return { label: 'Complete', color: 'badge-success' };
        } else if (completion >= 50) {
            return { label: 'In Progress', color: 'badge-warning' };
        } else {
            return { label: 'Basic', color: 'badge-info' };
        }
    },

    // Generate Cloudinary upload URL
    generateCloudinaryUploadUrl: (): string => {
        return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    },

    // Validate image file
    validateImageFile: (file: File): { isValid: boolean; error?: string } => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return { 
                isValid: false, 
                error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' 
            };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { 
                isValid: false, 
                error: 'File too large. Maximum size is 5MB' 
            };
        }

        return { isValid: true };
    },
}

// Types export for external use
export type {
    UserProfile,
    UserWithProfile,
    PublicProfile,
    UpdateProfileRequest,
    ProfileCompletion,
    NotificationPreferences,
    ValidationResponse,
    CloudinaryUploadResponse,
}