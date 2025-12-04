import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain';

export interface Review {
    review_id: number;
    customer_name: string;
    rating: number;
    comment: string | null;
    created_at: string;
    registration_number: string;
    color: string;
    make: string;
    model: string;
    year: number;
    pickup_date: string;
    return_date: string;
}

export const ReviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${apiDomain}/reviews`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth?.token;
            if (token) headers.set('authorization', `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ['Review'],
    endpoints: (builder) => ({
        // Get visible reviews (for public display)
        getVisibleReviews: builder.query<Review[], void>({
            query: () => '/visible',
            providesTags: ['Review'],
        }),
        
        // Get all reviews (for admin)
        getAllReviews: builder.query<Review[], void>({
            query: () => '',
            providesTags: ['Review'],
        }),
        
        // Get reviews by vehicle
        getReviewsByVehicle: builder.query<Review[], number>({
            query: (vehicleId) => `/vehicle/${vehicleId}`,
            providesTags: ['Review'],
        }),
        
        // Get review statistics
        getReviewStatistics: builder.query<any, void>({
            query: () => '/stats/summary',
            providesTags: ['Review'],
        }),
        
        // Get top rated vehicles
        getTopRatedVehicles: builder.query<any[], void>({
            query: () => '/stats/top-vehicles',
            providesTags: ['Review'],
        }),
        
        // Create new review
        createReview: builder.mutation<Review, {
            booking_id: number;
            customer_id: number;
            rating: number;
            comment?: string;
        }>({
            query: (reviewData) => ({
                url: '',
                method: 'POST',
                body: reviewData,
            }),
            invalidatesTags: ['Review'],
        }),
        
        // Update review
        updateReview: builder.mutation<Review, {
            review_id: number;
            rating?: number;
            comment?: string;
        }>({
            query: ({ review_id, ...updateData }) => ({
                url: `/${review_id}`,
                method: 'PUT',
                body: updateData,
            }),
            invalidatesTags: ['Review'],
        }),
        
        // Delete review
        deleteReview: builder.mutation<void, number>({
            query: (review_id) => ({
                url: `/${review_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Review'],
        }),
    }),
});

export const { 
    useGetVisibleReviewsQuery,
    useGetAllReviewsQuery,
    useGetReviewsByVehicleQuery,
    useGetReviewStatisticsQuery,
    useGetTopRatedVehiclesQuery,
    useCreateReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation
} = ReviewApi;