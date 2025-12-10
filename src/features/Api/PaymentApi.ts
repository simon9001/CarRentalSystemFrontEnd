import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// TypeScript interfaces
interface Payment {
  payment_id: number
  booking_id: number
  amount: number
  payment_method: 'Mpesa' | 'Cash' | 'Card' | 'Bank Transfer'
  transaction_code: string | null
  payment_date: string
  payment_status: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Partially_Refunded'
  refund_amount: number
}

interface PaymentSummary {
  total_payments: number
  completed_payments: number
  pending_payments: number
  failed_payments: number
  refunded_payments: number
  total_revenue: number
  total_refunds: number
  net_revenue: number
}

interface GetAllPaymentsParams {
  page?: number
  limit?: number
  status?: string
  payment_method?: string
  start_date?: string
  end_date?: string
  search?: string
}

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

interface PaymentResponse {
  success: boolean
  data: Payment | Payment[] | PaymentSummary | { payments: Payment[], total_paid: number }
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const PaymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3000/api', // Updated base URL
    prepareHeaders: (headers) => {
      // Add any authentication headers if needed
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  tagTypes: ['Payment', 'PaymentSummary'],
  endpoints: (builder) => ({
    // =============================================
    // PAYMENT QUERIES (GET REQUESTS)
    // =============================================

    // ➤ Get payment summary for dashboard
    getPaymentSummary: builder.query<PaymentSummary, void>({
      query: () => '/summary/statistrics',
      providesTags: ['PaymentSummary'],
      transformResponse: (response: ApiResponse<PaymentSummary>) => {
        return response.success ? response.data : {} as PaymentSummary
      }
    }),

    // ➤ Get all payments with pagination and filters
    getAllPayments: builder.query<{
      data: Payment[],
      pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }, GetAllPaymentsParams>({
      query: ({ 
        page = 1, 
        limit = 10,
        status = '',
        payment_method = '',
        start_date = '',
        end_date = '',
        search = ''
      }: GetAllPaymentsParams = {}) => {
        const params = new URLSearchParams()
        
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        
        if (status) params.append('status', status)
        if (payment_method) params.append('payment_method', payment_method)
        if (start_date) params.append('start_date', start_date)
        if (end_date) params.append('end_date', end_date)
        if (search) params.append('search', search)
        
        return `/?${params.toString()}`
      },
      providesTags: (result) =>
        result ? [
          { type: 'Payment' as const, id: 'LIST' },
          ...result.data.map(({ payment_id }) => ({ type: 'Payment' as const, id: payment_id })),
        ] : [{ type: 'Payment' as const, id: 'LIST' }],
    }),

    // ➤ Get payment by ID
    getPaymentById: builder.query<Payment, number>({
      query: (payment_id: number) => `/${payment_id}`,
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
      transformResponse: (response: ApiResponse<Payment>) => {
        return response.success ? response.data : {} as Payment
      }
    }),

// Get payments by customer with optional status filter
getCustomerPayments: builder.query<ApiResponse<Payment[]>, { customerId: number; status?: string }>({
  query: ({ customerId, status }) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return `/customer/${customerId}?${params.toString()}`;
  },
  providesTags: (result) =>
    result && result.success ? [
      { type: 'Payment' as const, id: 'CUSTOMER_LIST' },
      ...(result.data as Payment[]).map(({ payment_id }) => ({ 
        type: 'Payment' as const, 
        id: payment_id 
      })),
    ] : [{ type: 'Payment' as const, id: 'CUSTOMER_LIST' }],
}),

// Process refund mutation
processRefund: builder.mutation<ApiResponse<Payment>, { 
  payment_id: number; 
  refund_amount: number; 
  is_partial?: boolean;
  reason?: string;
}>({
  query: ({ payment_id, refund_amount, is_partial, reason }) => ({
    url: `/${payment_id}/refund`,
    method: 'PATCH',
    body: { refund_amount, is_partial, reason },
  }),
  invalidatesTags: ['Payment', 'PaymentSummary'],
}),

    // ➤ Get payments by booking
    getPaymentsByBooking: builder.query<{
      payments: Payment[],
      total_paid: number
    }, number>({
      query: (booking_id: number) => `/booking/${booking_id}`,
      providesTags: (result) =>
        result ? [
          { type: 'Payment' as const, id: 'BOOKING_LIST' },
          ...result.payments.map(({ payment_id }) => ({ type: 'Payment' as const, id: payment_id })),
        ] : [{ type: 'Payment' as const, id: 'BOOKING_LIST' }],
      transformResponse: (response: ApiResponse<{ payments: Payment[], total_paid: number }>) => {
        return response.success ? response.data : { payments: [], total_paid: 0 }
      }
    }),

    // ➤ Get payments by status
    getPaymentsByStatus: builder.query<{
      data: Payment[],
      pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }, { status: string; page?: number; limit?: number }>({
      query: ({ status, page = 1, limit = 10 }) => {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        return `/status/${status}?${params.toString()}`
      },
      providesTags: (result) =>
        result ? [
          { type: 'Payment' as const, id: 'STATUS_LIST' },
          ...result.data.map(({ payment_id }) => ({ type: 'Payment' as const, id: payment_id })),
        ] : [{ type: 'Payment' as const, id: 'STATUS_LIST' }],
      transformResponse: (response: ApiResponse<Payment[]>) => {
        return response.success ? {
          data: response.data,
          pagination: response.pagination
        } : { data: [] }
      }
    }),

    // ➤ Get payments by method
    getPaymentsByMethod: builder.query<{
      data: Payment[],
      pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }, { method: string; page?: number; limit?: number }>({
      query: ({ method, page = 1, limit = 10 }) => {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        return `/method/${method}?${params.toString()}`
      },
      providesTags: (result) =>
        result ? [
          { type: 'Payment' as const, id: 'METHOD_LIST' },
          ...result.data.map(({ payment_id }) => ({ type: 'Payment' as const, id: payment_id })),
        ] : [{ type: 'Payment' as const, id: 'METHOD_LIST' }],
      transformResponse: (response: ApiResponse<Payment[]>) => {
        return response.success ? {
          data: response.data,
          pagination: response.pagination
        } : { data: [] }
      }
    }),

    // ➤ Get payment by transaction code
    getPaymentByTransactionCode: builder.query<Payment, string>({
      query: (transaction_code: string) => `/transaction/${transaction_code}`,
      providesTags: (result) => result ? [{ type: 'Payment', id: result.payment_id }] : [],
      transformResponse: (response: ApiResponse<Payment>) => {
        return response.success ? response.data : {} as Payment
      }
    }),

    // ➤ Get payments by date range
    getPaymentsByDateRange: builder.query<{
      data: Payment[],
      pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }, { start_date: string; end_date: string; page?: number; limit?: number }>({
      query: ({ start_date, end_date, page = 1, limit = 10 }) => {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        
        return {
          url: `/date-range?${params.toString()}`,
          method: 'POST',
          body: { start_date, end_date }
        }
      },
      providesTags: (result) =>
        result ? [
          { type: 'Payment' as const, id: 'DATE_RANGE_LIST' },
          ...result.data.map(({ payment_id }) => ({ type: 'Payment' as const, id: payment_id })),
        ] : [{ type: 'Payment' as const, id: 'DATE_RANGE_LIST' }],
      transformResponse: (response: ApiResponse<Payment[]>) => {
        return response.success ? {
          data: response.data,
          pagination: response.pagination
        } : { data: [] }
      }
    }),

    // =============================================
    // PAYMENT MUTATIONS (POST/PATCH/PUT/DELETE REQUESTS)
    // =============================================

    // ➤ Create new payment
    createPayment: builder.mutation<ApiResponse<Payment>, Partial<Payment>>({
      query: (paymentData) => ({
        url: '/',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payment', 'PaymentSummary'],
    }),

    // ➤ Update payment status
    updatePaymentStatus: builder.mutation<ApiResponse<Payment>, { payment_id: number; payment_status: string }>({
      query: ({ payment_id, payment_status }) => ({
        url: `/${payment_id}/status`,
        method: 'PATCH',
        body: { payment_status },
      }),
      invalidatesTags: ['Payment', 'PaymentSummary'],
    }),

    // ➤ Complete payment
    completePayment: builder.mutation<ApiResponse<Payment>, { payment_id: number; transaction_code?: string }>({
      query: ({ payment_id, transaction_code }) => ({
        url: `/${payment_id}/complete`,
        method: 'PATCH',
        body: { transaction_code },
      }),
      invalidatesTags: ['Payment', 'PaymentSummary'],
    }),

    // ➤ Fail payment
    failPayment: builder.mutation<ApiResponse<Payment>, number>({
      query: (payment_id: number) => ({
        url: `/${payment_id}/fail`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Payment', 'PaymentSummary'],
    }),

    // // ➤ Process refund
    // processRefund: builder.mutation<ApiResponse<Payment>, { payment_id: number; refund_amount: number }>({
    //   query: ({ payment_id, refund_amount }) => ({
    //     url: `/${payment_id}/refund`,
    //     method: 'PATCH',
    //     body: { refund_amount },
    //   }),
    //   invalidatesTags: ['Payment', 'PaymentSummary'],
    // }),

    // ➤ Update payment transaction code
    updatePaymentTransactionCode: builder.mutation<ApiResponse<Payment>, { payment_id: number; transaction_code: string }>({
      query: ({ payment_id, transaction_code }) => ({
        url: `/${payment_id}/transaction-code`,
        method: 'PATCH',
        body: { transaction_code },
      }),
      invalidatesTags: (result, error, { payment_id }) => [
        { type: 'Payment', id: payment_id },
        'PaymentSummary'
      ],
    }),

    // ➤ Delete payment
    deletePayment: builder.mutation<ApiResponse<void>, number>({
      query: (payment_id: number) => ({
        url: `/${payment_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payment', 'PaymentSummary'],
    }),
  }),
})

export const { 
  // Queries
  useGetPaymentSummaryQuery,
  useGetAllPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetPaymentsByBookingQuery,
  useGetPaymentsByStatusQuery,
  useGetPaymentsByMethodQuery,
  useGetPaymentByTransactionCodeQuery,
  useGetPaymentsByDateRangeQuery,

  // Mutations
  useCreatePaymentMutation,
  useUpdatePaymentStatusMutation,
  useCompletePaymentMutation,
  useFailPaymentMutation,
  // useProcessRefundMutation,
  useUpdatePaymentTransactionCodeMutation,
  useDeletePaymentMutation,
  useGetCustomerPaymentsQuery,
  useProcessRefundMutation,
} = PaymentApi