// src/features/api/CouponApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain'
import type { RootState } from '../../store/store'

// Type Definitions
export interface Coupon {
  coupon_id: number;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'flat';
  value: number;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  used_count: number;
  minimum_booking_amount: number;
  max_discount_amount: number | null;
  customer_scope: 'all' | 'new' | 'existing';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CreateCouponRequest {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'flat';
  value: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  minimum_booking_amount?: number;
  max_discount_amount?: number;
  customer_scope?: 'all' | 'new' | 'existing';
  status?: 'active' | 'inactive';
}

export interface UpdateCouponRequest {
  code?: string;
  description?: string;
  discount_type?: 'percentage' | 'flat';
  value?: number;
  start_date?: string;
  end_date?: string;
  usage_limit?: number | null;
  minimum_booking_amount?: number;
  max_discount_amount?: number | null;
  customer_scope?: 'all' | 'new' | 'existing';
  status?: 'active' | 'inactive';
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discount_amount?: number;
  message?: string;
}

export const CouponApi = createApi({
  reducerPath: 'couponApi',
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
  tagTypes: ['Coupon'],
  endpoints: (builder) => ({
    // =============================================
    // COUPON QUERIES (GET REQUESTS)
    // =============================================

    // Get all coupons
    getAllCoupons: builder.query<Coupon[], void>({
      query: () => '/coupons',
      transformResponse: (response: any) => {
        // Backend returns array directly or { error: string } or { message: string }
        if (Array.isArray(response)) {
          return response;
        } else if (response.error || response.message) {
          // Return empty array if error message
          return [];
        }
        return response || [];
      },
      providesTags: ['Coupon'],
    }),

    // Get active coupons (for customer display)
    getActiveCoupons: builder.query<Coupon[], void>({
      query: () => '/coupons/active',
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.error || response.message) {
          return [];
        }
        return response || [];
      },
      providesTags: ['Coupon'],
    }),

    // Get coupon by ID
    getCouponById: builder.query<Coupon, number>({
      query: (coupon_id) => `/coupons/${coupon_id}`,
      transformResponse: (response: any) => {
        if (response.error || response.message) {
          return null;
        }
        return response || null;
      },
      providesTags: ['Coupon'],
    }),

    // Get coupon by code
    getCouponByCode: builder.query<Coupon, string>({
      query: (code) => `/coupons/code/${code}`,
      transformResponse: (response: any) => {
        if (response.error || response.message) {
          return null;
        }
        return response || null;
      },
      providesTags: ['Coupon'],
    }),

    // Get coupons by status
    getCouponsByStatus: builder.query<Coupon[], string>({
      query: (status) => `/coupons/status/${status}`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.error || response.message) {
          return [];
        }
        return response || [];
      },
      providesTags: ['Coupon'],
    }),

    // Get coupons by customer scope
    getCouponsByCustomerScope: builder.query<Coupon[], string>({
      query: (customer_scope) => `/coupons/scope/${customer_scope}`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.error || response.message) {
          return [];
        }
        return response || [];
      },
      providesTags: ['Coupon'],
    }),

    // Validate coupon
    validateCoupon: builder.mutation<ValidateCouponResponse, { 
      code: string;
      booking_amount?: number;
      customer_type?: string;
    }>({
      query: (data) => ({
        url: '/coupons/validate',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => {
        return response || { valid: false, message: 'Validation failed' };
      },
    }),

    // Apply coupon
    applyCoupon: builder.mutation<ValidateCouponResponse, { 
      code: string;
      booking_amount?: number;
      customer_type?: string;
    }>({
      query: (data) => ({
        url: '/coupons/apply',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => {
        return response || { valid: false, message: 'Application failed' };
      },
    }),

    // Get expired coupons
    getExpiredCoupons: builder.query<Coupon[], void>({
      query: () => '/coupons/expired',
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.error || response.message) {
          return [];
        }
        return response || [];
      },
      providesTags: ['Coupon'],
    }),

    // Get fully used coupons
    getFullyUsedCoupons: builder.query<Coupon[], void>({
      query: () => '/coupons/fully-used',
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.error || response.message) {
          return [];
        }
        return response || [];
      },
      providesTags: ['Coupon'],
    }),

    // Get coupon usage statistics
    getCouponUsageStats: builder.query<any, void>({
      query: () => '/coupons/stats',
      transformResponse: (response: any) => {
        return response || null;
      },
      providesTags: ['Coupon'],
    }),

    // Get top performing coupons
    getTopPerformingCoupons: builder.query<any[], { limit?: number }>({
      query: ({ limit = 10 }) => `/coupons/top-performing?limit=${limit}`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response || [];
      },
      providesTags: ['Coupon'],
    }),

    // =============================================
    // COUPON MUTATIONS (POST/PUT/PATCH/DELETE REQUESTS)
    // =============================================

    // Create new coupon
    createCoupon: builder.mutation<Coupon, CreateCouponRequest>({
      query: (couponData) => ({
        url: '/coupons',
        method: 'POST',
        body: couponData,
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response.coupon || response;
      },
      invalidatesTags: ['Coupon'],
    }),

    // Update coupon
    updateCoupon: builder.mutation<Coupon, { coupon_id: number; updates: UpdateCouponRequest }>({
      query: ({ coupon_id, updates }) => ({
        url: `/coupons/${coupon_id}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response.updated_coupon || response;
      },
      invalidatesTags: ['Coupon'],
    }),

    // Update coupon status
    updateCouponStatus: builder.mutation<Coupon, { coupon_id: number; status: string }>({
      query: ({ coupon_id, status }) => ({
        url: `/coupons/${coupon_id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response.updated_coupon || response;
      },
      invalidatesTags: ['Coupon'],
    }),

    // Activate coupon
    activateCoupon: builder.mutation<Coupon, number>({
      query: (coupon_id) => ({
        url: `/coupons/${coupon_id}/activate`,
        method: 'PATCH',
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response.updated_coupon || response;
      },
      invalidatesTags: ['Coupon'],
    }),

    // Deactivate coupon
    deactivateCoupon: builder.mutation<Coupon, number>({
      query: (coupon_id) => ({
        url: `/coupons/${coupon_id}/deactivate`,
        method: 'PATCH',
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response.updated_coupon || response;
      },
      invalidatesTags: ['Coupon'],
    }),

    // Reset coupon usage
    resetCouponUsage: builder.mutation<Coupon, number>({
      query: (coupon_id) => ({
        url: `/coupons/${coupon_id}/reset-usage`,
        method: 'PATCH',
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response.updated_coupon || response;
      },
      invalidatesTags: ['Coupon'],
    }),

    // Delete coupon
    deleteCoupon: builder.mutation<{ message: string }, number>({
      query: (coupon_id) => ({
        url: `/coupons/${coupon_id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response || { message: 'Coupon deleted successfully' };
      },
      invalidatesTags: ['Coupon'],
    }),
  }),
})

export const { 
  // Queries
  useGetAllCouponsQuery,
  useGetActiveCouponsQuery,
  useGetCouponByIdQuery,
  useGetCouponByCodeQuery,
  useGetCouponsByStatusQuery,
  useGetCouponsByCustomerScopeQuery,
  useValidateCouponMutation,
  useApplyCouponMutation,
  useGetExpiredCouponsQuery,
  useGetFullyUsedCouponsQuery,
  useGetCouponUsageStatsQuery,
  useGetTopPerformingCouponsQuery,
  
  // Mutations
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useUpdateCouponStatusMutation,
  useActivateCouponMutation,
  useDeactivateCouponMutation,
  useResetCouponUsageMutation,
  useDeleteCouponMutation
} = CouponApi