import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain'

// Types
export interface CompanySettings {
  company_name: string
  logo_url: string | null
  primary_color: string
  support_email: string
  support_phone: string
  address: string
  tax_rate: number
  vat_number: string
}

export interface BookingSettings {
  default_daily_rate: number
  weekend_multiplier: number
  holiday_surcharge: number
  min_driver_age: number
  max_booking_days: number
  insurance_fee: number
  deposit_amount: number
  late_return_penalty: number
  cancellation_policy: string
  add_ons: Array<{
    id: string
    name: string
    price: number
    description: string
  }>
}

export interface VehicleSettings {
  service_interval_km: number
  service_interval_months: number
  reminder_threshold: number
  allowed_statuses: string[]
  branch_rental_limits: Record<string, number>
  vehicle_activation_rules: {
    min_insurance_days: number
    require_inspection: boolean
    require_documentation: boolean
  }
}

export interface PaymentSettings {
  daraja_consumer_key: string
  daraja_consumer_secret: string
  daraja_shortcode: string
  daraja_callback_url: string
  stripe_public_key: string
  stripe_secret_key: string
  enabled_payment_methods: string[]
  default_currency: string
  transaction_timeout: number
  invoice_start_number: number
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  is_active: boolean
  last_login: string | null
  created_at: string
}

export interface SecuritySettings {
  enable_2fa: boolean
  force_password_reset: boolean
  session_timeout: number
  password_policy: {
    min_length: number
    require_special_char: boolean
    require_numbers: boolean
    require_uppercase: boolean
  }
}

export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  created_at: string
  expires_at: string | null
  last_used: string | null
}

// API
export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiDomain}/admin/settings`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Company', 'Booking', 'Vehicle', 'Payment', 'Security', 'AdminUser', 'ApiKey'],
  endpoints: (builder) => ({
    // Company Settings
    getCompanySettings: builder.query<CompanySettings, void>({
      query: () => '/company',
      providesTags: ['Company'],
    }),
    updateCompanySettings: builder.mutation<CompanySettings, Partial<CompanySettings>>({
      query: (settings) => ({
        url: '/company',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Company'],
    }),

    // Booking Settings
    getBookingSettings: builder.query<BookingSettings, void>({
      query: () => '/bookings',
      providesTags: ['Booking'],
    }),
    updateBookingSettings: builder.mutation<BookingSettings, Partial<BookingSettings>>({
      query: (settings) => ({
        url: '/bookings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Booking'],
    }),

    // Vehicle Settings
    getVehicleSettings: builder.query<VehicleSettings, void>({
      query: () => '/vehicles',
      providesTags: ['Vehicle'],
    }),
    updateVehicleSettings: builder.mutation<VehicleSettings, Partial<VehicleSettings>>({
      query: (settings) => ({
        url: '/vehicles',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Vehicle'],
    }),

    // Payment Settings
    getPaymentSettings: builder.query<PaymentSettings, void>({
      query: () => '/payments',
      providesTags: ['Payment'],
    }),
    updatePaymentSettings: builder.mutation<PaymentSettings, Partial<PaymentSettings>>({
      query: (settings) => ({
        url: '/payments',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Payment'],
    }),

    // Security Settings
    getSecuritySettings: builder.query<SecuritySettings, void>({
      query: () => '/security',
      providesTags: ['Security'],
    }),
    updateSecuritySettings: builder.mutation<SecuritySettings, Partial<SecuritySettings>>({
      query: (settings) => ({
        url: '/security',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Security'],
    }),

    // Admin Users
    getAdminUsers: builder.query<AdminUser[], void>({
      query: () => '/admin-users',
      providesTags: ['AdminUser'],
    }),
    createAdminUser: builder.mutation<AdminUser, Partial<AdminUser>>({
      query: (user) => ({
        url: '/admin-users',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['AdminUser'],
    }),
    updateAdminUser: builder.mutation<AdminUser, { id: string; updates: Partial<AdminUser> }>({
      query: ({ id, updates }) => ({
        url: `/admin-users/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['AdminUser'],
    }),
    deleteAdminUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin-users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminUser'],
    }),

    // API Keys
    generateApiKey: builder.mutation<ApiKey, { name: string; permissions: string[] }>({
      query: (data) => ({
        url: '/api-keys',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApiKey'],
    }),
    getApiKeys: builder.query<ApiKey[], void>({
      query: () => '/api-keys',
      providesTags: ['ApiKey'],
    }),
    revokeApiKey: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api-keys/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ApiKey'],
    }),
  }),
})

export const {
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
  useGetBookingSettingsQuery,
  useUpdateBookingSettingsMutation,
  useGetVehicleSettingsQuery,
  useUpdateVehicleSettingsMutation,
  useGetPaymentSettingsQuery,
  useUpdatePaymentSettingsMutation,
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGenerateApiKeyMutation,
  useGetApiKeysQuery,
  useRevokeApiKeyMutation,
} = settingsApi