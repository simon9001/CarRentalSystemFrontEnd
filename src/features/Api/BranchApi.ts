// src/features/api/BranchApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain'
import type { 
    BranchResponse,
    CreateBranchRequest,
    UpdateBranchRequest,
    UpdateBranchStatusRequest,
    UpdateBranchManagerRequest
} from '../../types/Branchtypes'

export const BranchApi = createApi({
    reducerPath: 'branchApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${apiDomain}`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth?.token
            if (token) headers.set('authorization', `Bearer ${token}`)
            return headers
        },
    }),
    tagTypes: ['Branch'],
    endpoints: (builder) => ({
        // Get all branches
        getAllBranches: builder.query<BranchResponse[], void>({
            query: () => '/branches',
            providesTags: ['Branch'],
        }),
        
        // Get active branches
        getActiveBranches: builder.query<BranchResponse[], void>({
            query: () => '/branches/active',
            providesTags: ['Branch'],
        }),
        
        // Get branch by ID
        getBranchById: builder.query<BranchResponse, number>({
            query: (branch_id) => `/branches/${branch_id}`,
            providesTags: ['Branch'],
        }),
        
        // Get branch by name
        getBranchByName: builder.query<BranchResponse, string>({
            query: (branch_name) => `/branches/name/${branch_name}`,
            providesTags: ['Branch'],
        }),
        
        // Get branches by city
        getBranchesByCity: builder.query<BranchResponse[], string>({
            query: (city) => `/branches/city/${city}`,
            providesTags: ['Branch'],
        }),
        
        // Get branches by status
        getBranchesByStatus: builder.query<BranchResponse[], string>({
            query: (status) => `/branches/status/${status}`,
            providesTags: ['Branch'],
        }),
        
        // Get branches by manager
        getBranchesByManager: builder.query<BranchResponse[], number>({
            query: (manager_id) => `/branches/manager/${manager_id}`,
            providesTags: ['Branch'],
        }),
        
        // Get branch statistics
        getBranchStatistics: builder.query<any, number>({
            query: (branch_id) => `/branches/${branch_id}/statistics`,
            providesTags: ['Branch'],
        }),
        
        // Get branch summary
        getBranchSummary: builder.query<any, void>({
            query: () => '/branches/summary/dashboard',
            providesTags: ['Branch'],
        }),
        
        // Get branches by city summary
        getBranchesByCitySummary: builder.query<any[], void>({
            query: () => '/branches/summary/cities',
            providesTags: ['Branch'],
        }),
        
        // Check branch name availability
        checkBranchNameAvailability: builder.query<{ available: boolean }, string>({
            query: (branch_name) => `/branches/check-name/${branch_name}`,
        }),
        
        // Create branch
        createBranch: builder.mutation<BranchResponse, CreateBranchRequest>({
            query: (branchData) => ({
                url: '/branches',
                method: 'POST',
                body: branchData,
            }),
            invalidatesTags: ['Branch'],
        }),
        
        // Update branch
        updateBranch: builder.mutation<BranchResponse, { branch_id: number; updates: UpdateBranchRequest }>({
            query: ({ branch_id, updates }) => ({
                url: `/branches/${branch_id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ['Branch'],
        }),
        
        // Update branch status
        updateBranchStatus: builder.mutation<BranchResponse, { branch_id: number; status: UpdateBranchStatusRequest }>({
            query: ({ branch_id, status }) => ({
                url: `/branches/${branch_id}/status`,
                method: 'PATCH',
                body: status,
            }),
            invalidatesTags: ['Branch'],
        }),
        
        // Update branch manager
        updateBranchManager: builder.mutation<BranchResponse, { branch_id: number; manager: UpdateBranchManagerRequest }>({
            query: ({ branch_id, manager }) => ({
                url: `/branches/${branch_id}/manager`,
                method: 'PATCH',
                body: manager,
            }),
            invalidatesTags: ['Branch'],
        }),
        
        // Activate branch
        activateBranch: builder.mutation<BranchResponse, number>({
            query: (branch_id) => ({
                url: `/branches/${branch_id}/activate`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Branch'],
        }),
        
        // Deactivate branch
        deactivateBranch: builder.mutation<BranchResponse, number>({
            query: (branch_id) => ({
                url: `/branches/${branch_id}/deactivate`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Branch'],
        }),
        
        // Remove branch manager
        removeBranchManager: builder.mutation<BranchResponse, number>({
            query: (branch_id) => ({
                url: `/branches/${branch_id}/remove-manager`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Branch'],
        }),
        
        // Delete branch
        deleteBranch: builder.mutation<{ message: string }, number>({
            query: (branch_id) => ({
                url: `/branches/${branch_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Branch'],
        }),
    }),
})

export const { 
    useGetAllBranchesQuery,
    useGetActiveBranchesQuery,
    useGetBranchByIdQuery,
    useGetBranchByNameQuery,
    useGetBranchesByCityQuery,
    useGetBranchesByStatusQuery,
    useGetBranchesByManagerQuery,
    useGetBranchStatisticsQuery,
    useGetBranchSummaryQuery,
    useGetBranchesByCitySummaryQuery,
    useCheckBranchNameAvailabilityQuery,
    useCreateBranchMutation,
    useUpdateBranchMutation,
    useUpdateBranchStatusMutation,
    useUpdateBranchManagerMutation,
    useActivateBranchMutation,
    useDeactivateBranchMutation,
    useRemoveBranchManagerMutation,
    useDeleteBranchMutation
} = BranchApi