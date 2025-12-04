// src/features/api/CarModelApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain'
import type { 
    CarModelResponse,
    CreateCarModelRequest,
    UpdateCarModelRequest,
    UpdateCarModelStatusRequest,
    UpdateCarModelDailyRateRequest
} from '../../types/modelTypes'

export const CarModelApi = createApi({
    reducerPath: 'carModelApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${apiDomain}`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth?.token
            if (token) headers.set('authorization', `Bearer ${token}`)
            return headers
        },
    }),
    tagTypes: ['CarModel'],
    endpoints: (builder) => ({
        // Get all car models
        getAllCarModels: builder.query<CarModelResponse[], void>({
            query: () => '/car-models',
            providesTags: ['CarModel'],
        }),
        
        // Get active car models only
        getActiveCarModels: builder.query<CarModelResponse[], void>({
            query: () => '/car-models/active',
            providesTags: ['CarModel'],
        }),
        
        // Get car model by ID
        getCarModelById: builder.query<CarModelResponse, number>({
            query: (model_id) => `/car-models/${model_id}`,
            providesTags: ['CarModel'],
        }),
        
        // Get car models by make
        getCarModelsByMake: builder.query<CarModelResponse[], string>({
            query: (make) => `/car-models/make/${make}`,
            providesTags: ['CarModel'],
        }),
        
        // Get car models by vehicle type
        getCarModelsByVehicleType: builder.query<CarModelResponse[], string>({
            query: (vehicle_type) => `/car-models/type/${vehicle_type}`,
            providesTags: ['CarModel'],
        }),
        
        // Get car models by fuel type
        getCarModelsByFuelType: builder.query<CarModelResponse[], string>({
            query: (fuel_type) => `/car-models/fuel/${fuel_type}`,
            providesTags: ['CarModel'],
        }),
        
        // Create new car model
        createCarModel: builder.mutation<CarModelResponse, CreateCarModelRequest>({
            query: (carModelData) => ({
                url: '/car-models',
                method: 'POST',
                body: carModelData,
            }),
            invalidatesTags: ['CarModel'],
        }),
        
        // Update car model
        updateCarModel: builder.mutation<CarModelResponse, { model_id: number; updates: UpdateCarModelRequest }>({
            query: ({ model_id, updates }) => ({
                url: `/car-models/${model_id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ['CarModel'],
        }),
        
        // Update car model status
        updateCarModelStatus: builder.mutation<CarModelResponse, { model_id: number; status: UpdateCarModelStatusRequest }>({
            query: ({ model_id, status }) => ({
                url: `/car-models/${model_id}/status`,
                method: 'PATCH',
                body: status,
            }),
            invalidatesTags: ['CarModel'],
        }),
        
        // Update car model daily rate
        updateCarModelDailyRate: builder.mutation<CarModelResponse, { model_id: number; daily_rate: UpdateCarModelDailyRateRequest }>({
            query: ({ model_id, daily_rate }) => ({
                url: `/car-models/${model_id}/daily-rate`,
                method: 'PATCH',
                body: daily_rate,
            }),
            invalidatesTags: ['CarModel'],
        }),
        
        // Delete car model
        deleteCarModel: builder.mutation<{ message: string }, number>({
            query: (model_id) => ({
                url: `/car-models/${model_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CarModel'],
        }),
        
        // Get car model features
        getCarModelFeatures: builder.query<string[], number>({
            query: (model_id) => `/car-models/${model_id}/features`,
            providesTags: ['CarModel'],
        }),
    }),
})

export const { 
    useGetAllCarModelsQuery,
    useGetActiveCarModelsQuery,
    useGetCarModelByIdQuery,
    useGetCarModelsByMakeQuery,
    useGetCarModelsByVehicleTypeQuery,
    useGetCarModelsByFuelTypeQuery,
    useCreateCarModelMutation,
    useUpdateCarModelMutation,
    useUpdateCarModelStatusMutation,
    useUpdateCarModelDailyRateMutation,
    useDeleteCarModelMutation,
    useGetCarModelFeaturesQuery
} = CarModelApi