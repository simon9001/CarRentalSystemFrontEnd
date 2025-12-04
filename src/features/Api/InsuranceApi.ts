import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const InsuranceApi = createApi({
  reducerPath: 'insuranceApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/insurance',
  }),
  tagTypes: ['Insurance'],
  endpoints: (builder) => ({
    getInsuranceSummary: builder.query({
      query: () => '/summary',
    }),
    getActiveInsurance: builder.query({
      query: () => '/active',
    }),
  }),
})