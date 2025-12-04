// features/Api/damageApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


interface GetAllDamageReportsParams {
  page?: number;
  limit?: number;
  status?: string;
  vehicle_id?: string;
  customer_id?: string;
  booking_id?: string;
  start_date?: string;
  end_date?: string;
  min_cost?: number | string; // Allow both number and string
  max_cost?: number | string; // Allow both number and string
  search?: string;
}

// TypeScript interfaces
interface DamageReport {
  incident_id: number
  booking_id: number
  vehicle_id: number
  customer_id: number
  incident_description: string
  damage_cost: number
  date_recorded: string
  resolved_date: string | null
  status: 'Reported' | 'Assessed' | 'Repaired' | 'Closed'
  photos: string | null
  customer_name?: string
  customer_email?: string
  registration_number?: string
  make?: string
  model?: string
  year?: number
  color?: string
}

interface DamageSummary {
  total_incidents: number
  reported_incidents: number
  assessed_incidents: number
  repaired_incidents: number
  closed_incidents: number
  total_damage_cost: number
  average_damage_cost: number
  recovered_cost: number
}

interface DamageCostByVehicle {
  vehicle_id: number
  registration_number: string
  make: string
  model: string
  year: number
  incident_count: number
  total_damage_cost: number
  average_damage_cost: number
}

// interface GetAllDamageReportsParams {
//   page?: number
//   limit?: number
//   status?: string
//   vehicle_id?: string
//   customer_id?: string
//   booking_id?: string
//   start_date?: string
//   end_date?: string
//   min_cost?: number
//   max_cost?: number
//   search?: string
// }

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const DamageApi = createApi({
  reducerPath: 'damageApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3000/api/damage-reports',
  }),
  tagTypes: ['Damage', 'DamageSummary'],
  endpoints: (builder) => ({
    // =============================================
    // DAMAGE QUERIES (GET REQUESTS)
    // =============================================

    // ➤ Get damage report summary for dashboard
    getDamageReportSummary: builder.query<DamageSummary, void>({
      query: () => '/summary',
      providesTags: ['DamageSummary'],
      transformResponse: (response: ApiResponse<DamageSummary>) => {
        return response.success ? response.data : {} as DamageSummary
      }
    }),

    // ➤ Get unresolved damage reports
    getUnresolvedDamageReports: builder.query<DamageReport[], void>({
      query: () => '/unresolved',
      providesTags: ['Damage'],
      transformResponse: (response: ApiResponse<DamageReport[]>) => {
        return response.success ? response.data : []
      }
    }),

    // ➤ Get all damage reports with pagination and filters
    // In DamageApi.ts, update the getAllDamageReports endpoint:
getAllDamageReports: builder.query<ApiResponse<DamageReport[]>, GetAllDamageReportsParams>({
  query: ({ 
    page = 1, 
    limit = 10,
    status = '',
    vehicle_id = '',
    customer_id = '',
    booking_id = '',
    start_date = '',
    end_date = '',
    min_cost,
    max_cost,
    search = ''
  }: GetAllDamageReportsParams = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (status) params.append('status', status)
    if (vehicle_id) params.append('vehicle_id', vehicle_id)
    if (customer_id) params.append('customer_id', customer_id)
    if (booking_id) params.append('booking_id', booking_id)
    if (start_date) params.append('start_date', start_date)
    if (end_date) params.append('end_date', end_date)
    if (min_cost !== undefined && min_cost !== '') params.append('min_cost', min_cost.toString())
    if (max_cost !== undefined && max_cost !== '') params.append('max_cost', max_cost.toString())
    if (search) params.append('search', search)
    
    return `?${params.toString()}`
  },
  providesTags: ['Damage'],
}),

    // ➤ Get damage report by ID
    getDamageReportById: builder.query<DamageReport, number>({
      query: (incident_id: number) => `/${incident_id}`,
      providesTags: ['Damage'],
      transformResponse: (response: ApiResponse<DamageReport>) => {
        return response.success ? response.data : {} as DamageReport
      }
    }),

    // ➤ Get damage reports by booking
    getDamageReportsByBooking: builder.query<DamageReport[], number>({
      query: (booking_id: number) => `/booking/${booking_id}`,
      providesTags: ['Damage'],
      transformResponse: (response: ApiResponse<DamageReport[]>) => {
        return response.success ? response.data : []
      }
    }),

    // ➤ Get damage reports by vehicle
    getDamageReportsByVehicle: builder.query<DamageReport[], number>({
      query: (vehicle_id: number) => `/vehicle/${vehicle_id}`,
      providesTags: ['Damage'],
      transformResponse: (response: ApiResponse<DamageReport[]>) => {
        return response.success ? response.data : []
      }
    }),

    // ➤ Get damage reports by customer
    getDamageReportsByCustomer: builder.query<DamageReport[], number>({
      query: (customer_id: number) => `/customer/${customer_id}`,
      providesTags: ['Damage'],
      transformResponse: (response: ApiResponse<DamageReport[]>) => {
        return response.success ? response.data : []
      }
    }),

    // ➤ Get damage reports by status
    getDamageReportsByStatus: builder.query<DamageReport[], string>({
      query: (status: string) => `/status/${status}`,
      providesTags: ['Damage'],
      transformResponse: (response: ApiResponse<DamageReport[]>) => {
        return response.success ? response.data : []
      }
    }),

    // ➤ Get damage reports by date range
    getDamageReportsByDateRange: builder.query<DamageReport[], { start_date: string; end_date: string }>({
      query: ({ start_date, end_date }) => ({
        url: '/date-range',
        method: 'POST',
        body: { start_date, end_date }
      }),
      providesTags: ['Damage'],
      transformResponse: (response: ApiResponse<DamageReport[]>) => {
        return response.success ? response.data : []
      }
    }),

    // ➤ Get damage cost by vehicle
    getDamageCostByVehicle: builder.query<DamageCostByVehicle[], void>({
      query: () => '/damage-cost',
      providesTags: ['Damage'],
      transformResponse: (response: ApiResponse<DamageCostByVehicle[]>) => {
        return response.success ? response.data : []
      }
    }),

    // =============================================
    // DAMAGE MUTATIONS (POST/PATCH/PUT/DELETE REQUESTS)
    // =============================================

    // ➤ Create new damage report
    createDamageReport: builder.mutation<DamageReport, Partial<DamageReport>>({
      query: (damageData) => ({
        url: '/',
        method: 'POST',
        body: damageData,
      }),
      invalidatesTags: ['Damage', 'DamageSummary'],
    }),

    // ➤ Update damage report
    updateDamageReport: builder.mutation<DamageReport, { incident_id: number; updates: Partial<DamageReport> }>({
      query: ({ incident_id, updates }) => ({
        url: `/${incident_id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Damage', 'DamageSummary'],
    }),

    // ➤ Update damage report status
    updateDamageReportStatus: builder.mutation<DamageReport, { incident_id: number; status: string }>({
      query: ({ incident_id, status }) => ({
        url: `/${incident_id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Damage', 'DamageSummary'],
    }),

    // ➤ Update damage cost
    updateDamageCost: builder.mutation<DamageReport, { incident_id: number; damage_cost: number }>({
      query: ({ incident_id, damage_cost }) => ({
        url: `/${incident_id}/cost`,
        method: 'PATCH',
        body: { damage_cost },
      }),
      invalidatesTags: ['Damage', 'DamageSummary'],
    }),

    // ➤ Close damage report
    closeDamageReport: builder.mutation<DamageReport, number>({
      query: (incident_id: number) => ({
        url: `/${incident_id}/close`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Damage', 'DamageSummary'],
    }),

    // ➤ Reopen damage report
    reopenDamageReport: builder.mutation<DamageReport, number>({
      query: (incident_id: number) => ({
        url: `/${incident_id}/reopen`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Damage', 'DamageSummary'],
    }),

    // ➤ Delete damage report
    deleteDamageReport: builder.mutation<void, number>({
      query: (incident_id: number) => ({
        url: `/${incident_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Damage', 'DamageSummary'],
    }),
  }),
})

export const { 
  // Queries
  useGetDamageReportSummaryQuery,
  useGetUnresolvedDamageReportsQuery,
  useGetAllDamageReportsQuery,
  useGetDamageReportByIdQuery,
  useGetDamageReportsByBookingQuery,
  useGetDamageReportsByVehicleQuery,
  useGetDamageReportsByCustomerQuery,
  useGetDamageReportsByStatusQuery,
  useGetDamageReportsByDateRangeQuery,
  useGetDamageCostByVehicleQuery,

  // Mutations
  useCreateDamageReportMutation,
  useUpdateDamageReportMutation,
  useUpdateDamageReportStatusMutation,
  useUpdateDamageCostMutation,
  useCloseDamageReportMutation,
  useReopenDamageReportMutation,
  useDeleteDamageReportMutation,
} = DamageApi