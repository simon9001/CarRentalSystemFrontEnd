// src/features/Api/UserApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain';
import { 
    type UserResponse, 
    type CreateUserRequest, 
    type UpdateUserRequest,
    type UpdatePasswordRequest,
    type UpdateVerificationRequest,
    type  UpdateMFARequest,
    type UpdateStatusRequest,
    type UserStatistics 
} from '../../types/UserTypes.ts';

export const UserApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${apiDomain}/users`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth?.token;
            if (token) headers.set('authorization', `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        // Create new user
        createUser: builder.mutation<UserResponse, CreateUserRequest>({
            query: (userData) => ({
                url: '',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),
        
        // Get all users
        getAllUsers: builder.query<UserResponse[], void>({
            query: () => '',
            providesTags: ['User'],
        }),
        
        // Get user by ID
        getUserById: builder.query<UserResponse, number>({
            query: (userId) => `/${userId}`,
            providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
        }),
        
        // Get user by username
        getUserByUsername: builder.query<UserResponse, string>({
            query: (username) => `/username/${username}`,
            providesTags: (result, error, username) => [{ type: 'User', id: username }],
        }),
        
        // Get user by email
        getUserByEmail: builder.query<UserResponse, string>({
            query: (email) => `/email/${email}`,
            providesTags: (result, error, email) => [{ type: 'User', id: email }],
        }),
        
        // Update user
        updateUser: builder.mutation<UserResponse, {
            userId: number;
            data: UpdateUserRequest
        }>({
            query: ({ userId, data }) => ({
                url: `/${userId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'User', id: userId },
                { type: 'User' }
            ],
        }),
        
        // Update user password
        updateUserPassword: builder.mutation<UserResponse, {
            userId: number;
            data: UpdatePasswordRequest
        }>({
            query: ({ userId, data }) => ({
                url: `/${userId}/password`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'User', id: userId }
            ],
        }),
        
        // Update user verification
        updateUserVerification: builder.mutation<UserResponse, {
            userId: number;
            data: UpdateVerificationRequest
        }>({
            query: ({ userId, data }) => ({
                url: `/${userId}/verification`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'User', id: userId }
            ],
        }),
        
        // Update user MFA
        updateUserMFA: builder.mutation<UserResponse, {
            userId: number;
            data: UpdateMFARequest
        }>({
            query: ({ userId, data }) => ({
                url: `/${userId}/mfa`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'User', id: userId }
            ],
        }),
        
        // Update user status
        updateUserStatus: builder.mutation<UserResponse, {
            userId: number;
            data: UpdateStatusRequest
        }>({
            query: ({ userId, data }) => ({
                url: `/${userId}/status`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'User', id: userId },
                { type: 'User' }
            ],
        }),

        updateUserRole: builder.mutation<UserResponse, {
            userId: number;
            role: string;
        }>({
            query: ({ userId, role }) => ({
                url: `/${userId}/role`,
                method: 'PATCH',
                body: { role },
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'User', id: userId },
                { type: 'User' }
            ],
        }),
        
        // Delete user
        deleteUser: builder.mutation<void, number>({
            query: (userId) => ({
                url: `/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
        
        // Get user statistics
        getUserStatistics: builder.query<UserStatistics, void>({
            query: () => '/stats/summary',
            providesTags: ['User'],
        }),
        
        // Search users
        searchUsers: builder.query<UserResponse[], {
            query: string;
            role?: string;
            status?: string;
        }>({
            query: (params) => ({
                url: '/search',
                method: 'GET',
                params,
            }),
            providesTags: ['User'],
        }),
    }),
});

export const { 
    useCreateUserMutation,
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useGetUserByUsernameQuery,
    useGetUserByEmailQuery,
    useUpdateUserMutation,
    useUpdateUserPasswordMutation,
    useUpdateUserVerificationMutation,
    useUpdateUserMFAMutation,
    useUpdateUserStatusMutation,
    useDeleteUserMutation,
    useGetUserStatisticsQuery,
    useUpdateUserRoleMutation,

    useSearchUsersQuery
} = UserApi;