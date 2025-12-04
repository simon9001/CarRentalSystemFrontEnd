// features/Api/maintenanceApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain'

// TypeScript interfaces - export all types
export interface ServiceRecord {
  service_id: number
  vehicle_id: number
  service_type: string
  service_date: string
  service_cost: number
  description: string | null
  next_service_date: string | null
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue'
  performed_by: string | null
  created_at: string
  registration_number?: string
  color?: string
  current_mileage?: number
  make?: string
  model?: string
  year?: number
  vehicle_type?: string
  vin_number?: string
}

export interface ServiceSummary {
  total_services: number
  completed_services: number
  scheduled_services: number
  in_progress_services: number
  overdue_services: number
  total_service_cost: number
  average_service_cost: number
}

export interface MaintenanceCostByVehicle {
  vehicle_id: number
  registration_number: string
  make: string
  model: string
  year: number
  service_count: number
  total_maintenance_cost: number
  average_service_cost: number
}

export interface GetAllServiceRecordsParams {
  page?: number
  limit?: number
  status?: string
  service_type?: string
  vehicle_id?: string
  start_date?: string
  end_date?: string
  search?: string
}

export interface ApiResponse<T> {
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

// Create base query with error handling
const baseQuery = fetchBaseQuery({ 
  baseUrl: `${apiDomain}`,
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    // Add auth token if needed
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
})

export const MaintenanceApi = createApi({
  reducerPath: 'maintenanceApi',
  baseQuery: baseQuery,
  tagTypes: ['ServiceRecord', 'ServiceSummary'],
  endpoints: (builder) => ({
    // =============================================
    // SERVICE RECORD QUERIES (GET REQUESTS)
    // =============================================

    // ➤ Get all service records with pagination and filters
    getAllServiceRecords: builder.query<ApiResponse<ServiceRecord[]>, GetAllServiceRecordsParams>({
      query: ({ 
        page = 1, 
        limit = 10,
        status = '',
        service_type = '',
        vehicle_id = '',
        start_date = '',
        end_date = '',
        search = ''
      }: GetAllServiceRecordsParams = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });
        
        if (status) params.append('status', status);
        if (service_type) params.append('service_type', service_type);
        if (vehicle_id) params.append('vehicle_id', vehicle_id);
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);
        if (search) params.append('search', search);
        
        return `/service/records?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.success && result.data
          ? [
              ...result.data.map(({ service_id }) => ({ type: 'ServiceRecord' as const, id: service_id })),
              'ServiceRecord',
            ]
          : ['ServiceRecord'],
      transformResponse: (response: any) => {
        return {
          success: response.success || true,
          data: response.data || [],
          message: response.message,
          pagination: response.pagination
        };
      }
    }),

    // ➤ Get service summary for dashboard
    getServiceSummary: builder.query<ServiceSummary, void>({
      query: () => '/service-records/summary',
      providesTags: ['ServiceSummary'],
      transformResponse: (response: ApiResponse<ServiceSummary>) => {
        return response.success ? response.data : {} as ServiceSummary;
      }
    }),

    // ➤ Get service record by ID
    getServiceRecordById: builder.query<ServiceRecord, number>({
      query: (service_id: number) => `/service-records/${service_id}`,
      providesTags: (result, error, service_id) => [{ type: 'ServiceRecord', id: service_id }],
      transformResponse: (response: ApiResponse<ServiceRecord>) => {
        return response.success ? response.data : {} as ServiceRecord;
      }
    }),

    // ➤ Get service records by vehicle
    getServiceRecordsByVehicle: builder.query<ServiceRecord[], number>({
      query: (vehicle_id: number) => `/service-records/vehicle/${vehicle_id}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ service_id }) => ({ type: 'ServiceRecord' as const, id: service_id })),
              'ServiceRecord',
            ]
          : ['ServiceRecord'],
      transformResponse: (response: ApiResponse<ServiceRecord[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // ➤ Get service records by status
    getServiceRecordsByStatus: builder.query<ServiceRecord[], string>({
      query: (status: string) => `/service-records/status/${status}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ service_id }) => ({ type: 'ServiceRecord' as const, id: service_id })),
              'ServiceRecord',
            ]
          : ['ServiceRecord'],
      transformResponse: (response: ApiResponse<ServiceRecord[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // ➤ Get service records by type
    getServiceRecordsByType: builder.query<ServiceRecord[], string>({
      query: (service_type: string) => `/service-records/type/${service_type}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ service_id }) => ({ type: 'ServiceRecord' as const, id: service_id })),
              'ServiceRecord',
            ]
          : ['ServiceRecord'],
      transformResponse: (response: ApiResponse<ServiceRecord[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // ➤ Get upcoming services
    getUpcomingServices: builder.query<ServiceRecord[], void>({
      query: () => '/service-records/upcoming',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ service_id }) => ({ type: 'ServiceRecord' as const, id: service_id })),
              'ServiceRecord',
            ]
          : ['ServiceRecord'],
      transformResponse: (response: ApiResponse<ServiceRecord[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // ➤ Get overdue services
    getOverdueServices: builder.query<ServiceRecord[], void>({
      query: () => '/service-records/overdue',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ service_id }) => ({ type: 'ServiceRecord' as const, id: service_id })),
              'ServiceRecord',
            ]
          : ['ServiceRecord'],
      transformResponse: (response: ApiResponse<ServiceRecord[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // ➤ Get recent services
    getRecentServices: builder.query<ServiceRecord[], { limit?: number }>({
      query: ({ limit = 5 } = {}) => {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        return `/service-records/recent?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ service_id }) => ({ type: 'ServiceRecord' as const, id: service_id })),
              'ServiceRecord',
            ]
          : ['ServiceRecord'],
      transformResponse: (response: ApiResponse<ServiceRecord[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // ➤ Get service records by date range (POST version)
    getServiceRecordsByDateRange: builder.query<ServiceRecord[], { start_date: string; end_date: string }>({
      query: ({ start_date, end_date }) => ({
        url: '/service-records/date-range',
        method: 'POST',
        body: { start_date, end_date }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ service_id }) => ({ type: 'ServiceRecord' as const, id: service_id })),
              'ServiceRecord',
            ]
          : ['ServiceRecord'],
      transformResponse: (response: ApiResponse<ServiceRecord[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // ➤ Get service records by date range (GET version with query params)
    getServiceRecordsByDateRangeQuery: builder.query<ServiceRecord[], { start_date: string; end_date: string }>({
      query: ({ start_date, end_date }) => {
        const params = new URLSearchParams({
          start_date,
          end_date
        });
        return `/service-records/date-range?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ service_id }) => ({ type: 'ServiceRecord' as const, id: service_id })),
              'ServiceRecord',
            ]
          : ['ServiceRecord'],
      transformResponse: (response: ApiResponse<ServiceRecord[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // ➤ Get maintenance cost by vehicle
    getMaintenanceCostByVehicle: builder.query<MaintenanceCostByVehicle[], void>({
      query: () => '/service-records/maintenance-cost',
      providesTags: ['ServiceSummary'],
      transformResponse: (response: ApiResponse<MaintenanceCostByVehicle[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // =============================================
    // SERVICE RECORD MUTATIONS (POST/PATCH/PUT/DELETE REQUESTS)
    // =============================================

    // ➤ Create new service record
    createServiceRecord: builder.mutation<ApiResponse<ServiceRecord>, Partial<ServiceRecord>>({
      query: (serviceData) => ({
        url: '/service/records',
        method: 'POST',
        body: serviceData,
      }),
      invalidatesTags: ['ServiceRecord', 'ServiceSummary'],
      transformResponse: (response: any) => {
        return {
          success: response.success || true,
          data: response.data,
          message: response.message
        };
      }
    }),

    // ➤ Update service record
    updateServiceRecord: builder.mutation<ApiResponse<ServiceRecord>, { service_id: number; updates: Partial<ServiceRecord> }>({
      query: ({ service_id, updates }) => ({
        url: `/service-records/${service_id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { service_id }) => [
        { type: 'ServiceRecord', id: service_id },
        'ServiceRecord', 
        'ServiceSummary'
      ],
      transformResponse: (response: any) => {
        return {
          success: response.success || true,
          data: response.data,
          message: response.message
        };
      }
    }),

    // ➤ Update service status
    updateServiceStatus: builder.mutation<ApiResponse<ServiceRecord>, { service_id: number; status: string }>({
      query: ({ service_id, status }) => ({
        url: `/service-records/${service_id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { service_id }) => [
        { type: 'ServiceRecord', id: service_id },
        'ServiceRecord', 
        'ServiceSummary'
      ],
      transformResponse: (response: any) => {
        return {
          success: response.success || true,
          data: response.data,
          message: response.message
        };
      }
    }),

    // ➤ Complete service
    completeService: builder.mutation<ApiResponse<ServiceRecord>, { service_id: number; actual_service_date?: string; performed_by?: string }>({
      query: ({ service_id, actual_service_date, performed_by }) => ({
        url: `/service-records/${service_id}/complete`,
        method: 'PATCH',
        body: { actual_service_date, performed_by },
      }),
      invalidatesTags: (result, error, { service_id }) => [
        { type: 'ServiceRecord', id: service_id },
        'ServiceRecord', 
        'ServiceSummary'
      ],
      transformResponse: (response: any) => {
        return {
          success: response.success || true,
          data: response.data,
          message: response.message
        };
      }
    }),

    // ➤ Update service cost
    updateServiceCost: builder.mutation<ApiResponse<ServiceRecord>, { service_id: number; service_cost: number }>({
      query: ({ service_id, service_cost }) => ({
        url: `/service-records/${service_id}/cost`,
        method: 'PATCH',
        body: { service_cost },
      }),
      invalidatesTags: (result, error, { service_id }) => [
        { type: 'ServiceRecord', id: service_id },
        'ServiceRecord', 
        'ServiceSummary'
      ],
      transformResponse: (response: any) => {
        return {
          success: response.success || true,
          data: response.data,
          message: response.message
        };
      }
    }),

    // ➤ Delete service record
    deleteServiceRecord: builder.mutation<ApiResponse<void>, number>({
      query: (service_id: number) => ({
        url: `/service-records/${service_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceRecord', 'ServiceSummary'],
      transformResponse: (response: any) => {
        return {
          success: response.success || true,
          data: response.data,
          message: response.message
        };
      }
    }),
  }),
})

// Export hooks with proper typing
export const { 
  // Queries
  useGetServiceSummaryQuery,
  useGetAllServiceRecordsQuery,
  useGetServiceRecordByIdQuery,
  useGetServiceRecordsByVehicleQuery,
  useGetServiceRecordsByStatusQuery,
  useGetServiceRecordsByTypeQuery,
  useGetUpcomingServicesQuery,
  useGetOverdueServicesQuery,
  useGetRecentServicesQuery,
  useGetServiceRecordsByDateRangeQuery,
  useGetServiceRecordsByDateRangeQueryQuery,
  useGetMaintenanceCostByVehicleQuery,

  // Mutations
  useCreateServiceRecordMutation,
  useUpdateServiceRecordMutation,
  useUpdateServiceStatusMutation,
  useCompleteServiceMutation,
  useUpdateServiceCostMutation,
  useDeleteServiceRecordMutation,
} = MaintenanceApi