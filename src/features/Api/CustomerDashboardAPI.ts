// features/Api/customerDashboardApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { 
    ApiResponse,
    CustomerDashboardData,
    CustomerDashboardStats,
    CustomerBooking,
    CustomerLoyaltyInfo,
    UpcomingBooking,
    VehicleRecommendation,
    CustomerActivity
} from '../../types/Types'
import { apiDomain } from '../../apiDomain/ApiDomain'

export const CustomerDashboardApi = createApi({
    reducerPath: 'customerDashboardApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${apiDomain}/coustomerdashboard`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    tagTypes: ['CustomerDashboard'],
    endpoints: (builder) => ({
        // Updated: Use ApiResponse wrapper
        getCustomerDashboardData: builder.query<ApiResponse<CustomerDashboardData>, number>({
            query: (customer_id) => `/${customer_id}`,
            providesTags: ['CustomerDashboard'],
        }),
        
        // Update other endpoints similarly if needed
        getCustomerDashboardStats: builder.query<ApiResponse<CustomerDashboardStats>, number>({
            query: (customer_id) => `/${customer_id}/stats`,
            providesTags: ['CustomerDashboard'],
        }),

        getCustomerBookingHistory: builder.query<ApiResponse<CustomerBooking[]>, { customer_id: number; limit?: number }>({
            query: ({ customer_id, limit = 10 }) => `/${customer_id}/bookings?limit=${limit}`,
            providesTags: ['CustomerDashboard'],
        }),

        getCustomerLoyaltyInfo: builder.query<ApiResponse<CustomerLoyaltyInfo>, number>({
            query: (customer_id) => `/${customer_id}/loyalty`,
            providesTags: ['CustomerDashboard'],
        }),

        getUpcomingBookings: builder.query<ApiResponse<UpcomingBooking[]>, number>({
            query: (customer_id) => `/${customer_id}/upcoming`,
            providesTags: ['CustomerDashboard'],
        }),

        getVehicleRecommendations: builder.query<ApiResponse<VehicleRecommendation[]>, { customer_id: number; limit?: number }>({
            query: ({ customer_id, limit = 5 }) => `/${customer_id}/recommendations?limit=${limit}`,
            providesTags: ['CustomerDashboard'],
        }),

        getCustomerRecentActivity: builder.query<ApiResponse<CustomerActivity[]>, { customer_id: number; limit?: number }>({
            query: ({ customer_id, limit = 10 }) => `/${customer_id}/activity?limit=${limit}`,
            providesTags: ['CustomerDashboard'],
        }),
    }),
})

export const { 
    useGetCustomerDashboardDataQuery,
    useGetCustomerDashboardStatsQuery,
    useGetCustomerBookingHistoryQuery,
    useGetCustomerLoyaltyInfoQuery,
    useGetUpcomingBookingsQuery,
    useGetVehicleRecommendationsQuery,
    useGetCustomerRecentActivityQuery
} = CustomerDashboardApi