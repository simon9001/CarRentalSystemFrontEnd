// features/api/DataboardDataApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { AdminDashboardStats } from '../../types/Types'

export const dashboardDataApi = createApi({
    reducerPath: 'dashboardDataApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: '/api/',
        // Add your authentication headers here
    }),
    tagTypes: ['Dashboard'],
    endpoints: (builder) => ({
        getAdminDashboardData: builder.query<AdminDashboardStats, void>({
            query: () => 'dashboard/stats',
            providesTags: ['Dashboard'],
        }),
    }),
})

export const { 
    useGetAdminDashboardDataQuery 
} = dashboardDataApi