import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const CouponApi = createApi({
  reducerPath: 'couponApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/coupons',
  }),
  tagTypes: ['Coupon'],
  endpoints: (builder) => ({
    getActiveCoupons: builder.query({
      query: () => '/active',
    }),
    getCouponUsageStats: builder.query({
      query: () => '/stats',
    }),
  }),
})