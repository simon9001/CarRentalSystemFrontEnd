// src/features/api/CouponUsageApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain'
import type { RootState } from '../../store/store'

// Type Definitions
export interface CouponUsageResponse {
  usage_id: number;
  customer_id: number;
  coupon_id: number;
  booking_id: number;
  used_at: string;
  discount_amount: number;
  customer_name?: string;
  customer_email?: string;
  coupon_code?: string;
  coupon_description?: string;
  discount_type?: string;
  coupon_value?: number;
  booking_final_total?: number;
}

export interface CreateCouponUsageRequest {
  customer_id: number;
  coupon_id: number;
  booking_id: number;
  discount_amount: number;
}

export const CouponUsageApi = createApi({
  reducerPath: 'couponUsageApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${apiDomain}`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState
      const token = state.auth.token;
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['CouponUsage'],
  endpoints: (builder) => ({
    // =============================================
    // COUPON USAGE QUERIES (GET REQUESTS)
    // =============================================

    // Get all coupon usage records
    getAllCouponUsage: builder.query<CouponUsageResponse[], void>({
      query: () => '/coupon-usage',
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.error || response.message) {
          return [];
        }
        return response || [];
      },
      providesTags: ['CouponUsage'],
    }),

    // Get coupon usage by usage_id
    getCouponUsageById: builder.query<CouponUsageResponse, number>({
      query: (usage_id) => `/coupon-usage/${usage_id}`,
      transformResponse: (response: any) => {
        if (response.error || response.message) {
          return null;
        }
        return response || null;
      },
      providesTags: ['CouponUsage'],
    }),

    // Get coupon usage by customer
    getCouponUsageByCustomer: builder.query<CouponUsageResponse[], number>({
      query: (customer_id) => `/coupon-usage/customer/${customer_id}`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.error || response.message) {
          return [];
        }
        return response || [];
      },
      providesTags: ['CouponUsage'],
    }),

    // Get coupon usage by coupon
    getCouponUsageByCoupon: builder.query<CouponUsageResponse[], number>({
      query: (coupon_id) => `/coupon-usage/coupon/${coupon_id}`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.error || response.message) {
          return [];
        }
        return response || [];
      },
      providesTags: ['CouponUsage'],
    }),

    // Get coupon usage by booking
    getCouponUsageByBooking: builder.query<CouponUsageResponse, number>({
      query: (booking_id) => `/coupon-usage/booking/${booking_id}`,
      transformResponse: (response: any) => {
        if (response.error || response.message) {
          return null;
        }
        return response || null;
      },
      providesTags: ['CouponUsage'],
    }),

    // Get coupon usage by date range
    getCouponUsageByDateRange: builder.query<CouponUsageResponse[], { start_date: string; end_date: string }>({
      query: ({ start_date, end_date }) => ({
        url: '/coupon-usage/date-range',
        method: 'POST',
        body: { start_date, end_date },
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.error || response.message) {
          return [];
        }
        return response || [];
      },
      providesTags: ['CouponUsage'],
    }),

    // Check if coupon has been used by customer
    checkCouponUsedByCustomer: builder.query<{ has_used_coupon: boolean }, { customer_id: number; coupon_id: number }>({
      query: ({ customer_id, coupon_id }) => 
        `/coupon-usage/customer/${customer_id}/coupon/${coupon_id}/check`,
      transformResponse: (response: any) => {
        if (response.error || response.message) {
          return { has_used_coupon: false };
        }
        return response || { has_used_coupon: false };
      },
    }),

    // Check if coupon has been used for booking
    checkCouponUsedForBooking: builder.query<{ has_used_coupon: boolean }, { booking_id: number; coupon_id: number }>({
      query: ({ booking_id, coupon_id }) => 
        `/coupon-usage/booking/${booking_id}/coupon/${coupon_id}/check`,
      transformResponse: (response: any) => {
        if (response.error || response.message) {
          return { has_used_coupon: false };
        }
        return response || { has_used_coupon: false };
      },
    }),

    // Get total discount amount by coupon
    getTotalDiscountByCoupon: builder.query<{ total_discount: number }, number>({
      query: (coupon_id) => `/coupon-usage/coupon/${coupon_id}/total-discount`,
      transformResponse: (response: any) => {
        if (response.error || response.message) {
          return { total_discount: 0 };
        }
        return response || { total_discount: 0 };
      },
    }),

    // Get total discount amount by customer
    getTotalDiscountByCustomer: builder.query<{ total_discount: number }, number>({
      query: (customer_id) => `/coupon-usage/customer/${customer_id}/total-discount`,
      transformResponse: (response: any) => {
        if (response.error || response.message) {
          return { total_discount: 0 };
        }
        return response || { total_discount: 0 };
      },
    }),

    // Get coupon usage summary
    getCouponUsageSummary: builder.query<any, void>({
      query: () => '/coupon-usage/summary',
      transformResponse: (response: any) => {
        if (response.error || response.message) {
          return null;
        }
        return response || null;
      },
    }),

    // Get top customers by coupon usage
    getTopCustomersByCouponUsage: builder.query<any[], { limit?: number }>({
      query: ({ limit = 10 }) => `/coupon-usage/top-customers?limit=${limit}`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response || [];
      },
    }),

    // Get most used coupons
    getMostUsedCoupons: builder.query<any[], { limit?: number }>({
      query: ({ limit = 10 }) => `/coupon-usage/most-used-coupons?limit=${limit}`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response || [];
      },
    }),

    // Get coupon usage trends
    getCouponUsageTrends: builder.query<any[], { months?: number }>({
      query: ({ months = 12 }) => `/coupon-usage/trends?months=${months}`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response || [];
      },
    }),

    // =============================================
    // COUPON USAGE MUTATIONS (POST/DELETE REQUESTS)
    // =============================================

    // Create coupon usage record
    createCouponUsage: builder.mutation<CouponUsageResponse, CreateCouponUsageRequest>({
      query: (couponUsageData) => ({
        url: '/coupon-usage',
        method: 'POST',
        body: couponUsageData,
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response.coupon_usage || response;
      },
      invalidatesTags: ['CouponUsage'],
    }),

    // Delete coupon usage by usage_id
    deleteCouponUsage: builder.mutation<{ message: string }, number>({
      query: (usage_id) => ({
        url: `/coupon-usage/${usage_id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response || { message: 'Coupon usage record deleted successfully' };
      },
      invalidatesTags: ['CouponUsage'],
    }),

    // Delete coupon usage by booking_id
    deleteCouponUsageByBooking: builder.mutation<{ message: string }, number>({
      query: (booking_id) => ({
        url: `/coupon-usage/booking/${booking_id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response || { message: 'Coupon usage deleted for booking' };
      },
      invalidatesTags: ['CouponUsage'],
    }),
  }),
})

export const { 
  // Queries
  useGetAllCouponUsageQuery,
  useGetCouponUsageByIdQuery,
  useGetCouponUsageByCustomerQuery,
  useGetCouponUsageByCouponQuery,
  useGetCouponUsageByBookingQuery,
  useGetCouponUsageByDateRangeQuery,
  useCheckCouponUsedByCustomerQuery,
  useCheckCouponUsedForBookingQuery,
  useGetTotalDiscountByCouponQuery,
  useGetTotalDiscountByCustomerQuery,
  useGetCouponUsageSummaryQuery,
  useGetTopCustomersByCouponUsageQuery,
  useGetMostUsedCouponsQuery,
  useGetCouponUsageTrendsQuery,
  
  // Mutations
  useCreateCouponUsageMutation,
  useDeleteCouponUsageMutation,
  useDeleteCouponUsageByBookingMutation
} = CouponUsageApi