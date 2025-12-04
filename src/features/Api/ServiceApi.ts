import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const ServiceApi = createApi({
  reducerPath: 'serviceApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/service-records',
  }),
  tagTypes: ['Service'],
  endpoints: (builder) => ({
    getServiceSummary: builder.query({
      query: () => '/summary',
    }),
    getUpcomingServices: builder.query({
      query: () => '/upcoming',
    }),
  }),
})