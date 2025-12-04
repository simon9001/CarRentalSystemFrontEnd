// features/api/VehicleApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain'
import type { 
    VehicleWithDetails, 
    VehicleListing, 
    VehicleResponse, 
    VehicleImage, 
    VehicleStatistics,
    CreateVehicleRequest,
    UpdateVehicleRequest,
    UpdateVehicleStatusRequest,
    UpdateVehicleMileageRequest,
    UpdateVehicleBranchRequest,
    UpdateVehicleDailyRateRequest,
    AddVehicleImageRequest,
    ServiceDueVehicle,
    InsuranceExpiringVehicle,
    CarModel,
    Branch
} from '../../types/vehicletype'

export const VehicleApi = createApi({
    reducerPath: 'vehicleApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${apiDomain}`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token')
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    tagTypes: ['Vehicle', 'VehicleImage', 'VehicleStats', 'CarModel', 'Branch'],
    endpoints: (builder) => ({
        // Vehicle Operations
        getAllVehicles: builder.query<VehicleWithDetails[], void>({
            query: () => '/vehicles',
            providesTags: ['Vehicle'],
        }),
        getVehicleById: builder.query<VehicleWithDetails, number>({
            query: (vehicle_id) => `/vehicles/${vehicle_id}`,
            providesTags: ['Vehicle'],
        }),
        createVehicle: builder.mutation<VehicleResponse, CreateVehicleRequest>({
            query: (vehicleData) => ({
                url: '/vehicles',
                method: 'POST',
                body: vehicleData,
            }),
            invalidatesTags: ['Vehicle', 'VehicleStats'],
        }),
        updateVehicle: builder.mutation<VehicleResponse, { vehicle_id: number; updates: UpdateVehicleRequest }>({
            query: ({ vehicle_id, updates }) => ({
                url: `/vehicles/${vehicle_id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ['Vehicle'],
        }),
        
        // Delete Operations - Both Hard and Soft
        deleteVehicle: builder.mutation<{ success: boolean; message: string }, number>({
            query: (vehicle_id) => ({
                url: `/vehicles/${vehicle_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Vehicle', 'VehicleStats'],
        }),
        
        // Soft Delete (Mark as Retired)
        softDeleteVehicle: builder.mutation<VehicleResponse, number>({
            query: (vehicle_id) => ({
                url: `/vehicles/${vehicle_id}/retire`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Vehicle', 'VehicleStats'],
        }),

        // Status Management
        updateVehicleStatus: builder.mutation<VehicleResponse, { vehicle_id: number; status: UpdateVehicleStatusRequest }>({
            query: ({ vehicle_id, status }) => ({
                url: `/vehicles/${vehicle_id}/status`,
                method: 'PATCH',
                body: status,
            }),
            invalidatesTags: ['Vehicle'],
        }),
        updateVehicleMileage: builder.mutation<VehicleResponse, { vehicle_id: number; mileage: UpdateVehicleMileageRequest }>({
            query: ({ vehicle_id, mileage }) => ({
                url: `/vehicles/${vehicle_id}/mileage`,
                method: 'PATCH',
                body: mileage,
            }),
            invalidatesTags: ['Vehicle'],
        }),
        updateVehicleBranch: builder.mutation<VehicleResponse, { vehicle_id: number; branch: UpdateVehicleBranchRequest }>({
            query: ({ vehicle_id, branch }) => ({
                url: `/vehicles/${vehicle_id}/branch`,
                method: 'PATCH',
                body: branch,
            }),
            invalidatesTags: ['Vehicle'],
        }),
        updateVehicleDailyRate: builder.mutation<VehicleResponse, { vehicle_id: number; daily_rate: UpdateVehicleDailyRateRequest }>({
            query: ({ vehicle_id, daily_rate }) => ({
                url: `/vehicles/${vehicle_id}/daily-rate`,
                method: 'PATCH',
                body: daily_rate,
            }),
            invalidatesTags: ['Vehicle'],
        }),

        // Filters & Search
        getAvailableVehicles: builder.query<VehicleListing[], void>({
            query: () => '/vehicles/available',
            providesTags: ['Vehicle'],
        }),
        getVehiclesByBranch: builder.query<VehicleWithDetails[], number>({
            query: (branch_id) => `/vehicles/branch/${branch_id}`,
            providesTags: ['Vehicle'],
        }),
        getVehiclesByType: builder.query<VehicleListing[], string>({
            query: (vehicle_type) => `/vehicles/available/type/${vehicle_type}`,
            providesTags: ['Vehicle'],
        }),
        getVehicleByRegistration: builder.query<VehicleWithDetails, string>({
            query: (registration_number) => `/vehicles/registration/${registration_number}`,
            providesTags: ['Vehicle'],
        }),
        getVehicleByVIN: builder.query<VehicleWithDetails, string>({
            query: (vin_number) => `/vehicles/vin/${vin_number}`,
            providesTags: ['Vehicle'],
        }),

        // Maintenance Alerts
        getVehiclesDueForService: builder.query<ServiceDueVehicle[], void>({
            query: () => '/vehicles/alerts/service-due',
            providesTags: ['Vehicle'],
        }),
        getVehiclesWithExpiringInsurance: builder.query<InsuranceExpiringVehicle[], void>({
            query: () => '/vehicles/alerts/insurance-expiring',
            providesTags: ['Vehicle'],
        }),

        // Statistics
        getVehicleStatistics: builder.query<VehicleStatistics, void>({
            query: () => '/vehicles/statistics/summary',
            providesTags: ['VehicleStats'],
        }),

        // Image Management
        addVehicleImage: builder.mutation<VehicleImage, { vehicle_id: number; image: AddVehicleImageRequest }>({
            query: ({ vehicle_id, image }) => ({
                url: `/vehicles/${vehicle_id}/images`,
                method: 'POST',
                body: image,
            }),
            invalidatesTags: ['VehicleImage'],
        }),
        getVehicleImages: builder.query<VehicleImage[], number>({
            query: (vehicle_id) => `/vehicles/${vehicle_id}/images`,
            providesTags: ['VehicleImage'],
        }),
        setPrimaryImage: builder.mutation<void, { vehicle_id: number; image_id: number }>({
            query: ({ vehicle_id, image_id }) => ({
                url: `/vehicles/${vehicle_id}/images/${image_id}/primary`,
                method: 'PATCH',
            }),
            invalidatesTags: ['VehicleImage'],
        }),
        deleteVehicleImage: builder.mutation<{ success: boolean; message: string }, number>({
            query: (image_id) => ({
                url: `/vehicles/images/${image_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['VehicleImage'],
        }),

        // Reference Data
        getAllCarModels: builder.query<CarModel[], void>({
            query: () => '/car-models',
            providesTags: ['CarModel'],
        }),
        getAllBranches: builder.query<Branch[], void>({
            query: () => '/branches',
            providesTags: ['Branch'],
        }),
    }),
})

export const { 
    useGetAllVehiclesQuery,
    useGetVehicleByIdQuery,
    useCreateVehicleMutation,
    useUpdateVehicleMutation,
    useDeleteVehicleMutation,
    useSoftDeleteVehicleMutation,
    useUpdateVehicleStatusMutation,
    useUpdateVehicleMileageMutation,
    useUpdateVehicleBranchMutation,
    useUpdateVehicleDailyRateMutation,
    useGetAvailableVehiclesQuery,
    useGetVehiclesByBranchQuery,
    useGetVehiclesByTypeQuery,
    useGetVehicleByRegistrationQuery,
    useGetVehicleByVINQuery,
    useGetVehiclesDueForServiceQuery,
    useGetVehiclesWithExpiringInsuranceQuery,
    useGetVehicleStatisticsQuery,
    useAddVehicleImageMutation,
    useGetVehicleImagesQuery,
    useSetPrimaryImageMutation,
    useDeleteVehicleImageMutation,
    useGetAllCarModelsQuery,
    useGetAllBranchesQuery
} = VehicleApi