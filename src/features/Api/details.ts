// src/features/Api/VehicleApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Vehicle Interfaces
export interface Vehicle {
  vehicle_id: number;
  model_id: number;
  registration_number: string;
  color: string;
  vin_number?: string;
  current_mileage: number;
  status: string;
  branch_id: number;
  insurance_expiry_date?: string;
  service_due_date?: string;
  actual_daily_rate?: number;
  custom_features?: string[];
  notes?: string;
  updated_at: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_type: string;
  transmission: string;
  seating_capacity: number;
  doors: number;
  standard_daily_rate: number;
  branch_name: string;
  branch_city: string;
  effective_daily_rate: number;
  images?: VehicleImage[];
}

export interface VehicleImage {
  image_id: number;
  image_url: string;
  image_type: string;
  is_primary: boolean;
  display_order: number;
  created_at: string[];
}

export interface CreateVehicleRequest {
  model_id: number;
  registration_number: string;
  color: string;
  vin_number?: string;
  current_mileage?: number;
  branch_id: number;
  actual_daily_rate?: number;
  custom_features?: string[];
  notes?: string;
}

export interface UpdateVehicleRequest {
  model_id?: number;
  registration_number?: string;
  color?: string;
  vin_number?: string;
  current_mileage?: number;
  branch_id?: number;
  actual_daily_rate?: number;
  custom_features?: string[];
  notes?: string;
}

export interface VehicleStatistics {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  average_daily_rate: number;
  total_revenue: number;
  vehicles_by_type: Array<{
    vehicle_type: string;
    count: number;
  }>;
  vehicles_by_status: Array<{
    status: string;
    count: number;
  }>;
}

export interface VehicleFilter {
  branch_id?: number;
  vehicle_type?: string;
  status?: string;
  min_daily_rate?: number;
  max_daily_rate?: number;
}

// Vehicle API
export const VehicleApi = createApi({
  reducerPath: 'vehicleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api',
    prepareHeaders: (headers) => {
      // Add auth headers if needed
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Vehicle', 'VehicleImage'],
  endpoints: (builder) => ({
    // =============================================
    // VEHICLE CREATION & BASIC OPERATIONS
    // =============================================
    
    // Create a new vehicle
    createVehicle: builder.mutation<Vehicle, CreateVehicleRequest>({
      query: (vehicleData) => ({
        url: '/vehicles',
        method: 'POST',
        body: vehicleData,
      }),
      invalidatesTags: ['Vehicle'],
    }),

    // Get all vehicles
    getAllVehicles: builder.query<Vehicle[], void>({
      query: () => '/vehicles',
      providesTags: ['Vehicle'],
    }),

    // Get available vehicles
    getAvailableVehicles: builder.query<Vehicle[], void>({
      query: () => '/vehicles/available',
      providesTags: ['Vehicle'],
    }),

    // Get vehicle by ID
    getVehicleById: builder.query<Vehicle, number>({
      query: (vehicle_id) => `/vehicles/${vehicle_id}`,
      providesTags: (result, error, vehicle_id) => [
        { type: 'Vehicle', id: vehicle_id }
      ],
    }),

    // Delete vehicle by ID
    deleteVehicle: builder.mutation<void, number>({
      query: (vehicle_id) => ({
        url: `/vehicles/${vehicle_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicle'],
    }),

    // =============================================
    // VEHICLE SEARCH & FILTERING
    // =============================================

    // Get available vehicles by branch
    getAvailableVehiclesByBranch: builder.query<Vehicle[], number>({
      query: (branch_id) => `/vehicles/available/branch/${branch_id}`,
      providesTags: ['Vehicle'],
    }),

    // Get available vehicles by type
    getAvailableVehiclesByType: builder.query<Vehicle[], string>({
      query: (vehicle_type) => `/vehicles/available/type/${vehicle_type}`,
      providesTags: ['Vehicle'],
    }),

    // Get vehicles by status
    getVehiclesByStatus: builder.query<Vehicle[], string>({
      query: (status) => `/vehicles/status/${status}`,
      providesTags: ['Vehicle'],
    }),

    // Get vehicles by branch
    getVehiclesByBranch: builder.query<Vehicle[], number>({
      query: (branch_id) => `/vehicles/branch/${branch_id}`,
      providesTags: ['Vehicle'],
    }),

    // Get vehicles by model
    getVehiclesByModel: builder.query<Vehicle[], number>({
      query: (model_id) => `/vehicles/model/${model_id}`,
      providesTags: ['Vehicle'],
    }),

    // Get vehicle by registration number
    getVehicleByRegistration: builder.query<Vehicle, string>({
      query: (registration_number) => `/vehicles/registration/${registration_number}`,
      providesTags: ['Vehicle'],
    }),

    // Get vehicle by VIN number
    getVehicleByVIN: builder.query<Vehicle, string>({
      query: (vin_number) => `/vehicles/vin/${vin_number}`,
      providesTags: ['Vehicle'],
    }),

    // =============================================
    // VEHICLE UPDATES & MAINTENANCE
    // =============================================

    // Update vehicle
    updateVehicle: builder.mutation<Vehicle, { vehicle_id: number; data: UpdateVehicleRequest }>({
      query: ({ vehicle_id, data }) => ({
        url: `/vehicles/${vehicle_id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { vehicle_id }) => [
        { type: 'Vehicle', id: vehicle_id }
      ],
    }),

    // Update vehicle status
    updateVehicleStatus: builder.mutation<Vehicle, { vehicle_id: number; status: string }>({
      query: ({ vehicle_id, status }) => ({
        url: `/vehicles/${vehicle_id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { vehicle_id }) => [
        { type: 'Vehicle', id: vehicle_id }
      ],
    }),

    // Update vehicle mileage
    updateVehicleMileage: builder.mutation<Vehicle, { vehicle_id: number; mileage: number }>({
      query: ({ vehicle_id, mileage }) => ({
        url: `/vehicles/${vehicle_id}/mileage`,
        method: 'PATCH',
        body: { mileage },
      }),
      invalidatesTags: (result, error, { vehicle_id }) => [
        { type: 'Vehicle', id: vehicle_id }
      ],
    }),

    // Update vehicle branch
    updateVehicleBranch: builder.mutation<Vehicle, { vehicle_id: number; branch_id: number }>({
      query: ({ vehicle_id, branch_id }) => ({
        url: `/vehicles/${vehicle_id}/branch`,
        method: 'PATCH',
        body: { branch_id },
      }),
      invalidatesTags: (result, error, { vehicle_id }) => [
        { type: 'Vehicle', id: vehicle_id }
      ],
    }),

    // Update vehicle daily rate
    updateVehicleDailyRate: builder.mutation<Vehicle, { vehicle_id: number; daily_rate: number }>({
      query: ({ vehicle_id, daily_rate }) => ({
        url: `/vehicles/${vehicle_id}/daily-rate`,
        method: 'PATCH',
        body: { daily_rate },
      }),
      invalidatesTags: (result, error, { vehicle_id }) => [
        { type: 'Vehicle', id: vehicle_id }
      ],
    }),

    // =============================================
    // VEHICLE MAINTENANCE & ALERTS
    // =============================================

    // Get vehicles due for service
    getVehiclesDueForService: builder.query<Vehicle[], void>({
      query: () => '/vehicles/alerts/service-due',
      providesTags: ['Vehicle'],
    }),

    // Get vehicles with expiring insurance
    getVehiclesWithExpiringInsurance: builder.query<Vehicle[], void>({
      query: () => '/vehicles/alerts/insurance-expiring',
      providesTags: ['Vehicle'],
    }),

    // =============================================
    // VEHICLE ANALYTICS & STATISTICS
    // =============================================

    // Get vehicle statistics
    getVehicleStatistics: builder.query<VehicleStatistics, void>({
      query: () => '/vehicles/statistics/summary',
      providesTags: ['Vehicle'],
    }),

    // =============================================
    // VEHICLE IMAGE MANAGEMENT
    // =============================================

    // Add image to vehicle
    addVehicleImage: builder.mutation<VehicleImage, { vehicle_id: number; imageData: FormData }>({
      query: ({ vehicle_id, imageData }) => ({
        url: `/vehicles/${vehicle_id}/images`,
        method: 'POST',
        body: imageData,
      }),
      invalidatesTags: (result, error, { vehicle_id }) => [
        { type: 'Vehicle', id: vehicle_id },
        'VehicleImage'
      ],
    }),

    // Get all images for a vehicle
    getVehicleImages: builder.query<VehicleImage[], number>({
      query: (vehicle_id) => `/vehicles/${vehicle_id}/images`,
      providesTags: ['VehicleImage'],
    }),

    // Set primary image
    setPrimaryImage: builder.mutation<void, { vehicle_id: number; image_id: number }>({
      query: ({ vehicle_id, image_id }) => ({
        url: `/vehicles/${vehicle_id}/images/${image_id}/primary`,
        method: 'PATCH',
      }),
      invalidatesTags: ['VehicleImage'],
    }),

    // Delete vehicle image
    deleteVehicleImage: builder.mutation<void, number>({
      query: (image_id) => ({
        url: `/vehicles/images/${image_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VehicleImage'],
    }),

    // =============================================
    // ADVANCED QUERIES
    // =============================================

    // Search vehicles with filters
    searchVehicles: builder.query<Vehicle[], VehicleFilter>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
        return `/vehicles/search?${params.toString()}`;
      },
      providesTags: ['Vehicle'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Basic operations
  useCreateVehicleMutation,
  useGetAllVehiclesQuery,
  useGetAvailableVehiclesQuery,
  useGetVehicleByIdQuery,
  useDeleteVehicleMutation,

  // Search and filtering
  useGetAvailableVehiclesByBranchQuery,
  useGetAvailableVehiclesByTypeQuery,
  useGetVehiclesByStatusQuery,
  useGetVehiclesByBranchQuery,
  useGetVehiclesByModelQuery,
  useGetVehicleByRegistrationQuery,
  useGetVehicleByVINQuery,

  // Updates
  useUpdateVehicleMutation,
  useUpdateVehicleStatusMutation,
  useUpdateVehicleMileageMutation,
  useUpdateVehicleBranchMutation,
  useUpdateVehicleDailyRateMutation,

  // Maintenance and alerts
  useGetVehiclesDueForServiceQuery,
  useGetVehiclesWithExpiringInsuranceQuery,

  // Analytics
  useGetVehicleStatisticsQuery,

  // Image management
  useAddVehicleImageMutation,
  useGetVehicleImagesQuery,
  useSetPrimaryImageMutation,
  useDeleteVehicleImageMutation,

  // Advanced queries
  useSearchVehiclesQuery,
} = VehicleApi;