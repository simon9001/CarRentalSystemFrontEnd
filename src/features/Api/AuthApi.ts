import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain';
import type { User, UserFormValues, RegisterFormValues, ApiResponse } from '../../types/Types';

// Response types based on your backend
interface LoginResponse {
    message: string;
    access_token: string;
    refresh_token: string;
    user: User;
    expires_in: number;
    token_type: string;
}

interface RegisterResponse {
    message: string;
    user_id: number;
    email_sent: boolean;
}

interface RefreshTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface PasswordResetRequestResponse {
    message: string;
    email_sent: boolean;
}

interface PasswordResetVerifyResponse {
    message: string;
}

interface EmailVerificationResponse {
    message: string;
    user?: {
        user_id: number;
        username: string;
        email: string;
        is_email_verified: boolean;
    };
}

interface LogoutResponse {
    message: string;
}

interface ChangePasswordResponse {
    message: string;
}

// Request types
interface LoginRequest {
    email: string;
    password: string;
    device_info?: string;
    ip_address?: string;
    user_agent?: string;
}

interface RefreshTokenRequest {
    refresh_token: string;
}

interface PasswordResetRequest {
    email: string;
}

interface PasswordResetVerifyRequest {
    token: string;
    new_password: string;
}

interface EmailVerificationRequest {
    token: string;
}

interface ResendVerificationRequest {
    email: string;
}

interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
}

export const AuthApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: apiDomain,
        prepareHeaders: (headers, { getState }) => {
            // Get token from auth state
            const token = (getState() as any).auth?.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Auth', 'User'],
    endpoints: (builder) => ({

        // User Login
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth', 'User'],
        }),

        // User Registration
        register: builder.mutation<RegisterResponse, RegisterFormValues>({
            query: (userInfo) => ({
                url: '/register',
                method: 'POST',
                body: userInfo,
            }),
        }),

        // Refresh Token
        refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
            query: (tokenData) => ({
                url: '/refresh-token',
                method: 'POST',
                body: tokenData,
            }),
        }),

        // Request Password Reset
        requestPasswordReset: builder.mutation<PasswordResetRequestResponse, PasswordResetRequest>({
            query: (emailData) => ({
                url: '/password-reset/request',
                method: 'POST',
                body: emailData,
            }),
        }),

        // Verify Password Reset
        verifyPasswordReset: builder.mutation<PasswordResetVerifyResponse, PasswordResetVerifyRequest>({
            query: (resetData) => ({
                url: '/password-reset/verify',
                method: 'POST',
                body: resetData,
            }),
        }),

        // Verify Email (POST)
        verifyEmail: builder.mutation<EmailVerificationResponse, EmailVerificationRequest>({
            query: (verificationData) => ({
                url: '/email-verify',
                method: 'POST',
                body: verificationData,
            }),
        }),

        // Resend Verification Email
        resendVerification: builder.mutation<ApiResponse<any>, ResendVerificationRequest>({
            query: (emailData) => ({
                url: '/resend-verification',
                method: 'POST',
                body: emailData,
            }),
        }),

        // Email Health Check
        emailHealthCheck: builder.query<{ email_service: string; timestamp: string }, void>({
            query: () => 'auth/email-health',
        }),

        // Get Current User (Protected)
        getCurrentUser: builder.query<User, void>({
            query: () => 'auth/me',
            providesTags: ['User'],
        }),

        // Logout (Protected)
        logout: builder.mutation<LogoutResponse, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth', 'User'],
        }),

        // Logout All Devices (Protected)
        logoutAll: builder.mutation<LogoutResponse, void>({
            query: () => ({
                url: '/logout-all',
                method: 'POST',
            }),
            invalidatesTags: ['Auth', 'User'],
        }),

        // Change Password (Protected)
        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
            query: (passwordData) => ({
                url: '/change-password',
                method: 'POST',
                body: passwordData,
            }),
        }),

    }),
})

// Export hooks for usage in components
export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshTokenMutation,
    useRequestPasswordResetMutation,
    useVerifyPasswordResetMutation,
    useVerifyEmailMutation,
    useResendVerificationMutation,
    useEmailHealthCheckQuery,
    useGetCurrentUserQuery,
    useLogoutMutation,
    useLogoutAllMutation,
    useChangePasswordMutation,
} = AuthApi