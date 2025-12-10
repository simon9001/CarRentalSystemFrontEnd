// src/features/api/CustomerDetailsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain'
import type { RootState } from '../../store/store'

// Type Definitions
export interface CustomerDetailsResponse {
  customer_id: number;
  username: string;
  email: string;
  phone_number: string | null;
  national_id: string | null;
  drivers_license_number: string | null;
  license_expiry: string | null;
  license_issue_date: string | null;
  license_issuing_authority: string | null;
  account_status: 'Active' | 'Suspended' | 'Inactive' | 'Pending_Verification';
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  verification_notes: string | null;
  loyalty_points: number;
  preferred_payment_method: string | null;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerDetailsRequest {
  customer_id: number;
  national_id?: string;
  drivers_license_number: string;
  license_expiry: string;
  license_issue_date?: string;
  license_issuing_authority?: string;
  account_status?: string;
  verification_status?: string;
  verification_notes?: string;
  preferred_payment_method?: string;
  marketing_opt_in?: boolean;
}

export interface UpdateCustomerDetailsRequest {
  national_id?: string;
  drivers_license_number?: string;
  license_expiry?: string;
  license_issue_date?: string;
  license_issuing_authority?: string;
  account_status?: string;
  verification_status?: string;
  verification_notes?: string;
  preferred_payment_method?: string;
  marketing_opt_in?: boolean;
}

export interface CustomerStatistics {
  total: number;
  active: number;
  suspended: number;
  verified: number;
  pending: number;
  expiredLicenses: number;
  expiringLicenses: number;
  byVerification: Record<string, number>;
  byAccountStatus: Record<string, number>;
}

export interface UserWithoutDetails {
  user_id: number;
  username: string;
  email: string;
  phone_number: string | null;
  created_at: string;
}

export const CustomerDetailsApi = createApi({
  reducerPath: 'customerDetailsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${apiDomain}`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState
      const token = state.auth.token;
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['CustomerDetails', 'CustomerStats'],
  endpoints: (builder) => ({
    // =============================================
    // CUSTOMER DETAILS QUERIES (GET REQUESTS)
    // =============================================

    // Get all customer details
    getAllCustomerDetails: builder.query<CustomerDetailsResponse[], void>({
      query: () => '/customer-details',
      transformResponse: (response: any) => response.success ? response.data : [],
      providesTags: ['CustomerDetails'],
    }),

    // Get customer details by customer_id
    getCustomerDetailsById: builder.query<CustomerDetailsResponse, number>({
      query: (customer_id) => `/customer-details/${customer_id}`,
      transformResponse: (response: any) => response.success ? response.data : null,
      providesTags: ['CustomerDetails'],
    }),

    // Get customer details by drivers license number
    getCustomerByDriversLicense: builder.query<CustomerDetailsResponse, string>({
      query: (drivers_license_number) => `/customer-details/license/${drivers_license_number}`,
      transformResponse: (response: any) => response.success ? response.data : null,
      providesTags: ['CustomerDetails'],
    }),

    // Get customer details by national ID
    getCustomerByNationalId: builder.query<CustomerDetailsResponse, string>({
      query: (national_id) => `/customer-details/national-id/${national_id}`,
      transformResponse: (response: any) => response.success ? response.data : null,
      providesTags: ['CustomerDetails'],
    }),

    // Get customers by verification status
    getCustomersByVerificationStatus: builder.query<CustomerDetailsResponse[], string>({
      query: (verification_status) => `/customer-details/verification-status/${verification_status}`,
      transformResponse: (response: any) => response.success ? response.data : [],
      providesTags: ['CustomerDetails'],
    }),

    // Get customers by account status
    getCustomersByAccountStatus: builder.query<CustomerDetailsResponse[], string>({
      query: (account_status) => `/customer-details/account-status/${account_status}`,
      transformResponse: (response: any) => response.success ? response.data : [],
      providesTags: ['CustomerDetails'],
    }),

    // Get customers with expired licenses
    getCustomersWithExpiredLicenses: builder.query<CustomerDetailsResponse[], void>({
      query: () => '/customer-details/alerts/expired-licenses',
      transformResponse: (response: any) => response.success ? response.data : [],
      providesTags: ['CustomerDetails'],
    }),

    // Get customers with licenses expiring soon
    getCustomersWithLicensesExpiringSoon: builder.query<CustomerDetailsResponse[], void>({
      query: () => '/customer-details/alerts/expiring-licenses',
      transformResponse: (response: any) => response.success ? response.data : [],
      providesTags: ['CustomerDetails'],
    }),

    // Get customer statistics
    getCustomerStatistics: builder.query<CustomerStatistics, void>({
      query: () => '/customer-details/stats/summary',
      transformResponse: (response: any) => response.success ? response.data : null,
      providesTags: ['CustomerStats'],
    }),

    // Get users who need customer details
    getUsersNeedingCustomerDetails: builder.query<UserWithoutDetails[], void>({
      query: () => '/users/needing-customer-details',
      transformResponse: (response: any) => response.success ? response.data : [],
      providesTags: ['CustomerDetails'],
    }),

    // =============================================
    // CUSTOMER DETAILS MUTATIONS (POST/PATCH/PUT/DELETE REQUESTS)
    // =============================================

    // Create customer details
    createCustomerDetails: builder.mutation<CustomerDetailsResponse, CreateCustomerDetailsRequest>({
      query: (customerData) => ({
        url: '/customer-details',
        method: 'POST',
        body: customerData,
      }),
      invalidatesTags: ['CustomerDetails', 'CustomerStats'],
    }),

    // Update customer details
    updateCustomerDetails: builder.mutation<CustomerDetailsResponse, { customer_id: number; updates: UpdateCustomerDetailsRequest }>({
      query: ({ customer_id, updates }) => ({
        url: `/customer-details/${customer_id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['CustomerDetails', 'CustomerStats'],
    }),

    // Update customer verification status
    updateCustomerVerification: builder.mutation<CustomerDetailsResponse, { customer_id: number; verification_status: string; verification_notes?: string }>({
      query: ({ customer_id, verification_status, verification_notes }) => ({
        url: `/customer-details/${customer_id}/verification`,
        method: 'PATCH',
        body: { verification_status, verification_notes },
      }),
      invalidatesTags: ['CustomerDetails', 'CustomerStats'],
    }),

    // Update customer account status
    updateCustomerAccountStatus: builder.mutation<CustomerDetailsResponse, { customer_id: number; account_status: string }>({
      query: ({ customer_id, account_status }) => ({
        url: `/customer-details/${customer_id}/account-status`,
        method: 'PATCH',
        body: { account_status },
      }),
      invalidatesTags: ['CustomerDetails', 'CustomerStats'],
    }),

    // Update customer loyalty points
    updateCustomerLoyaltyPoints: builder.mutation<CustomerDetailsResponse, { customer_id: number; loyalty_points: number }>({
      query: ({ customer_id, loyalty_points }) => ({
        url: `/customer-details/${customer_id}/loyalty-points`,
        method: 'PATCH',
        body: { loyalty_points },
      }),
      invalidatesTags: ['CustomerDetails'],
    }),

    // Add loyalty points
    addCustomerLoyaltyPoints: builder.mutation<CustomerDetailsResponse, { customer_id: number; points_to_add: number }>({
      query: ({ customer_id, points_to_add }) => ({
        url: `/customer-details/${customer_id}/add-loyalty-points`,
        method: 'PATCH',
        body: { points_to_add },
      }),
      invalidatesTags: ['CustomerDetails'],
    }),

    // Delete customer details
    deleteCustomerDetails: builder.mutation<{ message: string }, number>({
      query: (customer_id) => ({
        url: `/customer-details/${customer_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CustomerDetails', 'CustomerStats'],
    }),
  }),
})

export const { 
  // Queries
  useGetAllCustomerDetailsQuery,
  useGetCustomerDetailsByIdQuery,
  useGetCustomerByDriversLicenseQuery,
  useGetCustomerByNationalIdQuery,
  useGetCustomersByVerificationStatusQuery,
  useGetCustomersByAccountStatusQuery,
  useGetCustomersWithExpiredLicensesQuery,
  useGetCustomersWithLicensesExpiringSoonQuery,
  useGetCustomerStatisticsQuery,
  useGetUsersNeedingCustomerDetailsQuery,
  
  // Mutations
  useCreateCustomerDetailsMutation,
  useUpdateCustomerDetailsMutation,
  useUpdateCustomerVerificationMutation,
  useUpdateCustomerAccountStatusMutation,
  useUpdateCustomerLoyaltyPointsMutation,
  useAddCustomerLoyaltyPointsMutation,
  useDeleteCustomerDetailsMutation
} = CustomerDetailsApi