// Updated CustomerApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain'
import type { 
    CustomerDetailsResponse,
    CreateCustomerDetailsRequest,
    UpdateCustomerDetailsRequest,
    UpdateVerificationRequest,
    UpdateAccountStatusRequest,
    UpdateLoyaltyPointsRequest,
    AddLoyaltyPointsRequest,
    CustomerStatistics
} from '../../types/CustomerTypes'

// Backend response wrapper interface
interface BackendResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export const CustomerApi = createApi({
    reducerPath: 'customerApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${apiDomain}`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Customer'],
    endpoints: (builder) => ({
        // Get all customer details
        getAllCustomerDetails: builder.query<CustomerDetailsResponse[], void>({
            query: () => '/customer-details',
            transformResponse: (response: BackendResponse<CustomerDetailsResponse[]>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch customer details');
                }
                return response.data || [];
            },
            providesTags: ['Customer'],
        }),
        
        // Get customer details by ID
        getCustomerDetailsById: builder.query<CustomerDetailsResponse, number>({
            query: (customer_id) => `/customer-details/${customer_id}`,
            transformResponse: (response: BackendResponse<CustomerDetailsResponse>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Customer details not found');
                }
                return response.data!;
            },
            providesTags: (result, error, customer_id) => 
                [{ type: 'Customer', id: customer_id }],
        }),
        
        // Get customer details by drivers license
        getCustomerByDriversLicense: builder.query<CustomerDetailsResponse, string>({
            query: (drivers_license_number) => `/customer-details/license/${drivers_license_number}`,
            transformResponse: (response: BackendResponse<CustomerDetailsResponse>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Customer details not found');
                }
                return response.data!;
            },
            providesTags: ['Customer'],
        }),
        
        // Get customer details by national ID
        getCustomerByNationalId: builder.query<CustomerDetailsResponse, string>({
            query: (national_id) => `/customer-details/national-id/${national_id}`,
            transformResponse: (response: BackendResponse<CustomerDetailsResponse>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Customer details not found');
                }
                return response.data!;
            },
            providesTags: ['Customer'],
        }),
        
        // Get customers by verification status
        getCustomersByVerificationStatus: builder.query<CustomerDetailsResponse[], string>({
            query: (verification_status) => `/customer-details/verification-status/${verification_status}`,
            transformResponse: (response: BackendResponse<CustomerDetailsResponse[]>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch customers');
                }
                return response.data || [];
            },
            providesTags: ['Customer'],
        }),
        
        // Get customers by account status
        getCustomersByAccountStatus: builder.query<CustomerDetailsResponse[], string>({
            query: (account_status) => `/customer-details/account-status/${account_status}`,
            transformResponse: (response: BackendResponse<CustomerDetailsResponse[]>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch customers');
                }
                return response.data || [];
            },
            providesTags: ['Customer'],
        }),
        
        // Get customers with expired licenses
        getCustomersWithExpiredLicenses: builder.query<CustomerDetailsResponse[], void>({
            query: () => '/customer-details/alerts/expired-licenses',
            transformResponse: (response: BackendResponse<CustomerDetailsResponse[]>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch customers with expired licenses');
                }
                return response.data || [];
            },
            providesTags: ['Customer'],
        }),
        
        // Get customers with licenses expiring soon
        getCustomersWithLicensesExpiringSoon: builder.query<CustomerDetailsResponse[], void>({
            query: () => '/customer-details/alerts/expiring-licenses',
            transformResponse: (response: BackendResponse<CustomerDetailsResponse[]>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch customers with expiring licenses');
                }
                return response.data || [];
            },
            providesTags: ['Customer'],
        }),
        
        // Create customer details
        createCustomerDetails: builder.mutation<CustomerDetailsResponse, CreateCustomerDetailsRequest>({
            query: (customerData) => ({
                url: '/customer-details',
                method: 'POST',
                body: customerData,
            }),
            transformResponse: (response: BackendResponse<CustomerDetailsResponse>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to create customer details');
                }
                return response.data!;
            },
            invalidatesTags: ['Customer'],
        }),
        
        // Update customer details
        updateCustomerDetails: builder.mutation<CustomerDetailsResponse, { 
            customer_id: number; 
            updates: UpdateCustomerDetailsRequest 
        }>({
            query: ({ customer_id, updates }) => ({
                url: `/customer-details/${customer_id}`,
                method: 'PUT',
                body: updates,
            }),
            transformResponse: (response: BackendResponse<CustomerDetailsResponse>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to update customer details');
                }
                return response.data!;
            },
            invalidatesTags: (result, error, { customer_id }) => [
                { type: 'Customer', id: customer_id },
                { type: 'Customer' }
            ],
        }),
        
        // Update verification status
        updateVerification: builder.mutation<CustomerDetailsResponse, { 
            customer_id: number; 
            verification: UpdateVerificationRequest 
        }>({
            query: ({ customer_id, verification }) => ({
                url: `/customer-details/${customer_id}/verification`,
                method: 'PATCH',
                body: verification,
            }),
            transformResponse: (response: BackendResponse<CustomerDetailsResponse>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to update verification status');
                }
                return response.data!;
            },
            invalidatesTags: (result, error, { customer_id }) => [
                { type: 'Customer', id: customer_id }
            ],
        }),
        
        // Update account status
        updateAccountStatus: builder.mutation<CustomerDetailsResponse, { 
            customer_id: number; 
            account_status: UpdateAccountStatusRequest 
        }>({
            query: ({ customer_id, account_status }) => ({
                url: `/customer-details/${customer_id}/account-status`,
                method: 'PATCH',
                body: account_status,
            }),
            transformResponse: (response: BackendResponse<CustomerDetailsResponse>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to update account status');
                }
                return response.data!;
            },
            invalidatesTags: (result, error, { customer_id }) => [
                { type: 'Customer', id: customer_id }
            ],
        }),
        
        // Update loyalty points
        updateLoyaltyPoints: builder.mutation<CustomerDetailsResponse, { 
            customer_id: number; 
            loyalty_points: UpdateLoyaltyPointsRequest 
        }>({
            query: ({ customer_id, loyalty_points }) => ({
                url: `/customer-details/${customer_id}/loyalty-points`,
                method: 'PATCH',
                body: loyalty_points,
            }),
            transformResponse: (response: BackendResponse<CustomerDetailsResponse>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to update loyalty points');
                }
                return response.data!;
            },
            invalidatesTags: (result, error, { customer_id }) => [
                { type: 'Customer', id: customer_id }
            ],
        }),
        
        // Add loyalty points
        addLoyaltyPoints: builder.mutation<CustomerDetailsResponse, { 
            customer_id: number; 
            points: AddLoyaltyPointsRequest 
        }>({
            query: ({ customer_id, points }) => ({
                url: `/customer-details/${customer_id}/add-loyalty-points`,
                method: 'PATCH',
                body: points,
            }),
            transformResponse: (response: BackendResponse<CustomerDetailsResponse>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to add loyalty points');
                }
                return response.data!;
            },
            invalidatesTags: (result, error, { customer_id }) => [
                { type: 'Customer', id: customer_id }
            ],
        }),
        
        // Delete customer details
        deleteCustomerDetails: builder.mutation<{ message: string }, number>({
            query: (customer_id) => ({
                url: `/customer-details/${customer_id}`,
                method: 'DELETE',
            }),
            transformResponse: (response: BackendResponse<{ message: string }>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to delete customer details');
                }
                return { message: response.message || 'Customer details deleted successfully' };
            },
            invalidatesTags: ['Customer'],
        }),
        
        // Get customer statistics
        getCustomerStatistics: builder.query<CustomerStatistics, void>({
            query: () => '/customer-details/stats/summary',
            transformResponse: (response: BackendResponse<CustomerStatistics>) => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch customer statistics');
                }
                return response.data!;
            },
            providesTags: ['Customer'],
        }),
    }),
})

export const { 
    useGetAllCustomerDetailsQuery,
    useGetCustomerDetailsByIdQuery,
    useGetCustomerByDriversLicenseQuery,
    useGetCustomerByNationalIdQuery,
    useGetCustomersByVerificationStatusQuery,
    useGetCustomersByAccountStatusQuery,
    useGetCustomersWithExpiredLicensesQuery,
    useGetCustomersWithLicensesExpiringSoonQuery,
    useCreateCustomerDetailsMutation,
    useUpdateCustomerDetailsMutation,
    useUpdateVerificationMutation,
    useUpdateAccountStatusMutation,
    useUpdateLoyaltyPointsMutation,
    useAddLoyaltyPointsMutation,
    useDeleteCustomerDetailsMutation,
    useGetCustomerStatisticsQuery
} = CustomerApi