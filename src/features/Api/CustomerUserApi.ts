import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain'
import { type ApiResponse } from '../../types/CustomerTypes'

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

// Extended user info with profile data
interface UserWithProfile extends UserProfile {
    email?: string;
    phone_number?: string;
    username?: string;
    role?: string;
}

// Profile update request interface
// Profile update request interface
interface UpdateProfileRequest {
    first_name?: string | null;
    last_name?: string | null;
    middle_name?: string | null;
    date_of_birth?: string | null;
    gender?: 'Male' | 'Female' | 'Other' | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postal_code?: string | null;
    bio?: string | null;
    website?: string | null;
    company?: string | null;
    job_title?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    preferred_language?: string | null;
    notification_preferences?: string | null;
    is_public?: boolean;
}

// Public profile interface (for non-authenticated users)
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

// Profile completion status
interface ProfileCompletion {
    profile_completion_percentage: number;
    last_profile_update: string;
    profile_updated_count: number;
    completion_level: 'Basic' | 'Intermediate' | 'Complete';
}

// Notification preferences
interface NotificationPreferences {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    marketing?: boolean;
    updates?: boolean;
}

// Validation response
interface ValidationResponse {
    success: boolean;
    errors: string[];
    message: string;
}

export const UserProfileApi = createApi({
    reducerPath: 'userProfileApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${apiDomain}`, // FIXED: Added '/api/profile' to base URL
        prepareHeaders: (headers, { getState }) => {
            // Get token from auth state
            const state = getState() as any;
            const token = state?.auth?.token;
            
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
                headers.set('Content-Type', 'application/json');
            }
            return headers;
        },
    }),
    tagTypes: ['Profile', 'PublicProfile', 'ProfileCompletion'],
    endpoints: (builder) => ({
        // Get current user's profile (authenticated) - FIXED: Changed from '/${user_id}' to '/me'
        getCurrentProfile: builder.query<ApiResponse<UserWithProfile>, void>({
            query: () => '/me',
            providesTags: ['Profile'],
        }),

        // Get public profile by user ID (no authentication required)
        getPublicProfile: builder.query<ApiResponse<PublicProfile>, number>({
            query: (user_id) => `/public/${user_id}`,
            providesTags: (result, error, user_id) => [
                { type: 'PublicProfile', id: user_id }
            ],
        }),

        // Update current user's profile
        updateProfile: builder.mutation<ApiResponse<UserProfile>, UpdateProfileRequest>({
            query: (updates) => ({
                url: '/me',
                method: 'PATCH',
                body: updates,
            }),
            invalidatesTags: ['Profile'],
        }),

        // Upload profile picture
        uploadProfilePicture: builder.mutation<ApiResponse<{ profile_picture: string; profile_completion: number }>, FormData>({
            query: (formData) => ({
                url: '/me/profile-picture',
                method: 'POST',
                body: formData,
                // Don't set Content-Type header for FormData - browser will set it with boundary
            }),
            invalidatesTags: ['Profile'],
        }),

        // Get profile completion status
        getProfileCompletion: builder.query<ApiResponse<ProfileCompletion>, void>({
            query: () => '/me/completion',
            providesTags: ['ProfileCompletion'],
        }),

        // Validate profile data before update
        validateProfileData: builder.mutation<ValidationResponse, UpdateProfileRequest>({
            query: (profileData) => ({
                url: '/validate',
                method: 'POST',
                body: profileData,
            }),
        }),

        // Update notification preferences
        updateNotificationPreferences: builder.mutation<ApiResponse<{ notification_preferences: NotificationPreferences; profile_completion: number }>, NotificationPreferences>({
            query: (preferences) => ({
                url: '/me/notifications',
                method: 'PATCH',
                body: preferences,
            }),
            invalidatesTags: ['Profile'],
        }),

        // Toggle profile visibility
        toggleProfileVisibility: builder.mutation<ApiResponse<{ is_public: boolean }>, { is_public: boolean }>({
            query: (visibility) => ({
                url: '/me/visibility',
                method: 'PATCH',
                body: visibility,
            }),
            invalidatesTags: ['Profile'],
        }),

        // Get profile by user ID (admin or owner only)
        getProfileByUserId: builder.query<ApiResponse<UserWithProfile>, number>({
            query: (user_id) => `/${user_id}`,
            providesTags: (result, error, user_id) => [
                { type: 'Profile', id: user_id }
            ],
        }),

        // Update profile by user ID (admin or owner only)
        updateProfileByUserId: builder.mutation<ApiResponse<UserProfile>, { user_id: number } & UpdateProfileRequest>({
            query: ({ user_id, ...updates }) => ({
                url: `/${user_id}`,
                method: 'PATCH',
                body: updates,
            }),
            invalidatesTags: (result, error, { user_id }) => [
                { type: 'Profile', id: user_id },
                'Profile'
            ],
        }),

        // Delete profile (admin or owner)
        deleteProfile: builder.mutation<ApiResponse<{ message: string }>, number>({
            query: (user_id) => ({
                url: `/${user_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Profile'],
        }),

        // Admin: Get all profiles with search and pagination
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
                
                return `?${params.toString()}`;
            },
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ profile_id }) => ({ type: 'Profile' as const, id: profile_id })),
                        { type: 'Profile', id: 'LIST' },
                    ]
                    : [{ type: 'Profile', id: 'LIST' }],
        }),

        // Admin: Search profiles
        searchProfiles: builder.query<ApiResponse<UserWithProfile[]>, { 
            q: string; 
            limit?: number; 
            offset?: number 
        }>({
            query: ({ q, limit = 50, offset = 0 }) => 
                `/admin/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`,
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ profile_id }) => ({ type: 'Profile' as const, id: profile_id })),
                        { type: 'Profile', id: 'SEARCH' },
                    ]
                    : [{ type: 'Profile', id: 'SEARCH' }],
        }),

        // Admin: Get profile by profile_id
        getProfileById: builder.query<ApiResponse<UserWithProfile>, number>({
            query: (profile_id) => `/profile/${profile_id}`,
            providesTags: (result, error, profile_id) => [
                { type: 'Profile', id: profile_id }
            ],
        }),

        // Get user's full profile with user data
        getUserFullProfile: builder.query<ApiResponse<{
            profile: UserProfile;
            user: {
                email: string;
                phone_number: string | null;
                username: string;
                role: string;
                is_email_verified: boolean;
                is_phone_verified: boolean;
            };
        }>, number>({
            query: (user_id) => `/${user_id}/full`,
            providesTags: (result, error, user_id) => [
                { type: 'Profile', id: user_id }
            ],
        }),

        // Get user profile by username
        getProfileByUsername: builder.query<ApiResponse<PublicProfile>, string>({
            query: (username) => `/username/${username}`,
            providesTags: (result, error, username) => [
                { type: 'PublicProfile', id: username }
            ],
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
    useGetProfileCompletionQuery,
    useLazyGetProfileCompletionQuery,
    useValidateProfileDataMutation,
    useUpdateNotificationPreferencesMutation,
    useToggleProfileVisibilityMutation,

    // Public endpoints
    useGetPublicProfileQuery,
    useLazyGetPublicProfileQuery,
    useGetProfileByUsernameQuery,
    useLazyGetProfileByUsernameQuery,

    // User-specific endpoints (admin/owner)
    useGetProfileByUserIdQuery,
    useLazyGetProfileByUserIdQuery,
    useUpdateProfileByUserIdMutation,
    useDeleteProfileMutation,

    // Admin endpoints
    useGetAllProfilesQuery,
    useLazyGetAllProfilesQuery,
    useSearchProfilesQuery,
    useLazySearchProfilesQuery,
    useGetProfileByIdQuery,
    useLazyGetProfileByIdQuery,

    // Extended endpoints
    useGetUserFullProfileQuery,
    useLazyGetUserFullProfileQuery,
} = UserProfileApi

// Helper hooks for common operations
export const userProfileApi = UserProfileApi

// Utility functions for working with profiles
export const profileUtils = {
    // Calculate profile completion percentage (frontend version)
    calculateCompletion: (profile: Partial<UserProfile>): number => {
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
            first_name: profile.first_name,
            last_name: profile.last_name,
            middle_name: profile.middle_name,
            date_of_birth: profile.date_of_birth,
            gender: profile.gender,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            postal_code: profile.postal_code,
            bio: profile.bio,
            website: profile.website,
            company: profile.company,
            job_title: profile.job_title,
            emergency_contact_name: profile.emergency_contact_name,
            emergency_contact_phone: profile.emergency_contact_phone,
            preferred_language: profile.preferred_language,
            notification_preferences: profile.notification_preferences,
            is_public: profile.is_public,
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
}