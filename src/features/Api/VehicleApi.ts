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
import type { RootState } from '../../store/store'

export const VehicleApi = createApi({
    reducerPath: 'vehicleApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${apiDomain}`,
        prepareHeaders: (headers, { getState }) => {
            const state = getState() as RootState
            const token = state.auth.token;
            
            if (token) {
                headers.set('Authorization', `${token}`);
                headers.set('Content-Type', 'application/json');
            }
            return headers;
        },
    }),
    tagTypes: ['Vehicle', 'VehicleImage', 'VehicleStats', 'CarModel', 'Branch'],
    endpoints: (builder) => ({
        // Vehicle Operations
        getAllVehicles: builder.query<VehicleWithDetails[], void>({
            query: () => '/vehicle/get',
            providesTags: ['Vehicle'],
        }),
        
        // FIX: Vehicle endpoints should use singular 'vehicle' not 'vehicles'
        getVehicleById: builder.query<VehicleWithDetails, number>({
            query: (vehicle_id) => `/getvihicle/${vehicle_id}`, // FIXED: /vehicle/ not /vehicles/
            providesTags: ['Vehicle'],
        }),
        
        createVehicle: builder.mutation<VehicleResponse, CreateVehicleRequest>({
            query: (vehicleData) => ({
                url: '/vehicle',
                method: 'POST',
                body: vehicleData,
            }),
            invalidatesTags: ['Vehicle', 'VehicleStats'],
        }),
        
        updateVehicle: builder.mutation<VehicleResponse, { vehicle_id: number; updates: UpdateVehicleRequest }>({
            query: ({ vehicle_id, updates }) => ({
                url: `/vehicle/${vehicle_id}`, // FIXED: /vehicle/ not /vehicles/
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ['Vehicle'],
        }),
        
        // Delete Operations
        deleteVehicle: builder.mutation<{ success: boolean; message: string }, number>({
            query: (vehicle_id) => ({
                url: `/vehicle/${vehicle_id}`, // FIXED: /vehicle/ not /vehicles/
                method: 'DELETE',
            }),
            invalidatesTags: ['Vehicle', 'VehicleStats'],
        }),
        
        softDeleteVehicle: builder.mutation<VehicleResponse, number>({
            query: (vehicle_id) => ({
                url: `/vehicle/${vehicle_id}/retire`, // FIXED: /vehicle/ not /vehicles/
                method: 'PATCH',
            }),
            invalidatesTags: ['Vehicle', 'VehicleStats'],
        }),

        // Status Management - FIXED URLs
        updateVehicleStatus: builder.mutation<VehicleResponse, { vehicle_id: number; status: UpdateVehicleStatusRequest }>({
            query: ({ vehicle_id, status }) => ({
                url: `/vehicle/${vehicle_id}/status`, // FIXED
                method: 'PATCH',
                body: status,
            }),
            invalidatesTags: ['Vehicle'],
        }),
        
        updateVehicleMileage: builder.mutation<VehicleResponse, { vehicle_id: number; mileage: UpdateVehicleMileageRequest }>({
            query: ({ vehicle_id, mileage }) => ({
                url: `/vehicle/${vehicle_id}/mileage`, // FIXED
                method: 'PATCH',
                body: mileage,
            }),
            invalidatesTags: ['Vehicle'],
        }),
        
        updateVehicleBranch: builder.mutation<VehicleResponse, { vehicle_id: number; branch: UpdateVehicleBranchRequest }>({
            query: ({ vehicle_id, branch }) => ({
                url: `/vehicle/${vehicle_id}/branch`, // FIXED
                method: 'PATCH',
                body: branch,
            }),
            invalidatesTags: ['Vehicle'],
        }),
        
        updateVehicleDailyRate: builder.mutation<VehicleResponse, { vehicle_id: number; daily_rate: UpdateVehicleDailyRateRequest }>({
            query: ({ vehicle_id, daily_rate }) => ({
                url: `/vehicle/${vehicle_id}/daily-rate`, // FIXED
                method: 'PATCH',
                body: daily_rate,
            }),
            invalidatesTags: ['Vehicle'],
        }),

        // Filters & Search - FIXED URLs
        getAvailableVehicles: builder.query<VehicleListing[], void>({
            query: () => '/available/getvehicle',
            providesTags: ['Vehicle'],
        }),
        
        getVehiclesByBranch: builder.query<VehicleWithDetails[], number>({
            query: (branch_id) => `/available/branch/${branch_id}`, // FIXED
            providesTags: ['Vehicle'],
        }),
        
        getVehiclesByType: builder.query<VehicleListing[], string>({
            query: (vehicle_type) => `/available/type/${vehicle_type}`, // FIXED
            providesTags: ['Vehicle'],
        }),
        
        getVehicleByRegistration: builder.query<VehicleWithDetails, string>({
            query: (registration_number) => `/vehicle/registration/${registration_number}`, // FIXED
            providesTags: ['Vehicle'],
        }),
        
        getVehicleByVIN: builder.query<VehicleWithDetails, string>({
            query: (vin_number) => `/vehicle/vin/${vin_number}`, // FIXED
            providesTags: ['Vehicle'],
        }),

        // Maintenance Alerts - FIXED URLs
        getVehiclesDueForService: builder.query<ServiceDueVehicle[], void>({
            query: () => '/vehicle/alerts/service-due', // FIXED
            providesTags: ['Vehicle'],
        }),
        
        getVehiclesWithExpiringInsurance: builder.query<InsuranceExpiringVehicle[], void>({
            query: () => '/vehicle/alerts/insurance-expiring', // FIXED
            providesTags: ['Vehicle'],
        }),

        // Statistics
        getVehicleStatistics: builder.query<VehicleStatistics, void>({
            query: () => '/statistics/summary', // FIXED
            providesTags: ['VehicleStats'],
        }),

        // Image Management - CRITICAL FIX HERE
        addVehicleImage: builder.mutation<VehicleImage, { vehicle_id: number; image: AddVehicleImageRequest }>({
            query: ({ vehicle_id, image }) => ({
                url: `/${vehicle_id}/images`, // FIXED: /vehicle/ not /vehicles/
                method: 'POST',
                body: image,
            }),
            invalidatesTags: ['VehicleImage'],
        }),
        
        getVehicleImages: builder.query<VehicleImage[], number>({
            query: (vehicle_id) => `/${vehicle_id}/images`, // FIXED
            providesTags: ['VehicleImage'],
        }),
        
        setPrimaryImage: builder.mutation<void, { vehicle_id: number; image_id: number }>({
            query: ({ vehicle_id, image_id }) => ({
                url: `/vehicle/${vehicle_id}/images/${image_id}/primary`, // FIXED
                method: 'PATCH',
            }),
            invalidatesTags: ['VehicleImage'],
        }),
        
        deleteVehicleImage: builder.mutation<{ success: boolean; message: string }, number>({
            query: (image_id) => ({
                url: `/vehicle/images/${image_id}`, // FIXED
                method: 'DELETE',
            }),
            invalidatesTags: ['VehicleImage'],
        }),

        // Reference Data
        getAllCarModels: builder.query<CarModel[], void>({
            query: () => 'car-models/get',
            providesTags: ['CarModel'],
        }),
        
        getAllBranches: builder.query<Branch[], void>({
            query: () => '/branches/get',
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