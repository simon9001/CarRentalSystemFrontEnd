// features/Api/dashboardApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { 
    AdminDashboardStats, 
    DashboardData,
    RecentActivity,
    BookingAnalytics,
    VehicleStatusSummary,
    UserRoleSummary,
    BranchPerformance,
    PopularCarModel,
    SystemHealth
} from '../../types/Types'
import { apiDomain } from '../../apiDomain/ApiDomain'

// Add BackendResponse interface
interface BackendResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export const DashboardApi = createApi({
    reducerPath: 'dashboardApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${apiDomain}/`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Dashboard'],
    endpoints: (builder) => ({
        // Complete dashboard data
        getAdminDashboardData: builder.query<any, void>({
            query: () => 'dashboard',
            transformResponse: (response: BackendResponse<any>) => {
                console.log('Dashboard raw response:', response); // For debugging
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch dashboard data');
                }
                return response.data; // Extract the data field
            },
            providesTags: ['Dashboard'],
        }),
        
        // Dashboard statistics only
        getDashboardStats: builder.query<AdminDashboardStats, void>({
            query: () => 'dashboard/stats',
            transformResponse: (response: BackendResponse<AdminDashboardStats>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch dashboard stats');
                }
                return response.data!;
            },
            providesTags: ['Dashboard'],
        }),

        // Recent activities
        getRecentActivities: builder.query<RecentActivity[], { limit?: number }>({
            query: ({ limit = 10 }) => `dashboard/activities?limit=${limit}`,
            transformResponse: (response: BackendResponse<RecentActivity[]>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch recent activities');
                }
                return response.data || [];
            },
            providesTags: ['Dashboard'],
        }),

        // Booking analytics
        getBookingAnalytics: builder.query<BookingAnalytics[], { days?: number }>({
            query: ({ days = 30 }) => `dashboard/analytics?days=${days}`,
            transformResponse: (response: BackendResponse<BookingAnalytics[]>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch booking analytics');
                }
                return response.data || [];
            },
            providesTags: ['Dashboard'],
        }),

        // Vehicle status summary
        getVehicleStatusSummary: builder.query<VehicleStatusSummary[], void>({
            query: () => 'dashboard/vehicle-summary',
            transformResponse: (response: BackendResponse<VehicleStatusSummary[]>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch vehicle summary');
                }
                return response.data || [];
            },
            providesTags: ['Dashboard'],
        }),

        // User role summary
        getUserRoleSummary: builder.query<UserRoleSummary[], void>({
            query: () => 'dashboard/user-summary',
            transformResponse: (response: BackendResponse<UserRoleSummary[]>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch user role summary');
                }
                return response.data || [];
            },
            providesTags: ['Dashboard'],
        }),

        // Branch performance
        getBranchPerformance: builder.query<BranchPerformance[], void>({
            query: () => 'dashboard/branch-performance',
            transformResponse: (response: BackendResponse<BranchPerformance[]>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch branch performance');
                }
                return response.data || [];
            },
            providesTags: ['Dashboard'],
        }),

        // Popular car models
        getPopularCarModels: builder.query<PopularCarModel[], { limit?: number }>({
            query: ({ limit = 10 }) => `dashboard/popular-models?limit=${limit}`,
            transformResponse: (response: BackendResponse<PopularCarModel[]>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch popular models');
                }
                return response.data || [];
            },
            providesTags: ['Dashboard'],
        }),

        // System health
        getSystemHealth: builder.query<SystemHealth, void>({
            query: () => 'dashboard/system-health',
            transformResponse: (response: BackendResponse<SystemHealth>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch system health');
                }
                return response.data!;
            },
            providesTags: ['Dashboard'],
        }),

        // Quick stats
        getQuickStats: builder.query<any, void>({
            query: () => 'dashboard/quick-stats',
            transformResponse: (response: BackendResponse<any>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch quick stats');
                }
                return response.data!;
            },
            providesTags: ['Dashboard'],
        }),
    }),
})

export const { 
    useGetAdminDashboardDataQuery,
    useGetDashboardStatsQuery,
    useGetRecentActivitiesQuery,
    useGetBookingAnalyticsQuery,
    useGetVehicleStatusSummaryQuery,
    useGetUserRoleSummaryQuery,
    useGetBranchPerformanceQuery,
    useGetPopularCarModelsQuery,
    useGetSystemHealthQuery,
    useGetQuickStatsQuery
} = DashboardApi