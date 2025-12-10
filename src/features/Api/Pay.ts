import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface PaymentResponse {
  payment_id: number;
  booking_id: number;
  amount: number;
  payment_method: string;
  transaction_code: string | null;
  payment_date: string;
  payment_status: string;
  refund_amount: number;
}

interface PaymentSummary {
  total_payments: number;
  completed_payments: number;
  pending_payments: number;
  failed_payments: number;
  refunded_payments: number;
  total_revenue: number;
  total_refunds: number;
  net_revenue: number;
}

interface GetAllPaymentsResponse {
  success: boolean;
  data: {
    payments: PaymentResponse[];
    total: number;
  };
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const payviewmentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api/payments', // Update with your API URL
    prepareHeaders: (headers, { getState }) => {
      // Add auth token if needed
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    // Get all payments with filters
    getAllPayments: builder.query<GetAllPaymentsResponse, {
      page?: number;
      limit?: number;
      status?: string;
      payment_method?: string;
      start_date?: string;
      end_date?: string;
      search?: string;
    }>({
      query: (params) => ({
        url: '/pay',
        params,
      }),
      providesTags: ['Payment'],
    }),

    // Get payment by ID
    getPaymentById: builder.query({
      query: (paymentId) => `/pay/${paymentId}`,
      providesTags: ['Payment'],
    }),

    // Get payments by booking
    getPaymentsByBooking: builder.query({
      query: (bookingId) => `/pay/booking/${bookingId}`,
      providesTags: ['Payment'],
    }),

    // Get payment summary
    getPaymentSummary: builder.query<{ success: boolean; data: PaymentSummary }, void>({
      query: () => '/pay/summary',
    }),

    // Update payment status
    updatePaymentStatus: builder.mutation({
      query: ({ payment_id, payment_status }) => ({
        url: `/pay/${payment_id}/status`,
        method: 'PATCH',
        body: { payment_status },
      }),
      invalidatesTags: ['Payment'],
    }),

    // Complete payment
    completePayment: builder.mutation({
      query: ({ payment_id, transaction_code }) => ({
        url: `/pay/${payment_id}/complete`,
        method: 'PATCH',
        body: { transaction_code },
      }),
      invalidatesTags: ['Payment'],
    }),

    // Process refund
    processRefund: builder.mutation({
      query: ({ payment_id, refund_amount, is_partial }) => ({
        url: `/pay/${payment_id}/refund`,
        method: 'PATCH',
        body: { refund_amount, is_partial },
      }),
      invalidatesTags: ['Payment'],
    }),
  }),
});

export const {
  useGetAllPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetPaymentsByBookingQuery,
  useGetPaymentSummaryQuery,
  useUpdatePaymentStatusMutation,
  useCompletePaymentMutation,
  useProcessRefundMutation,
} = payviewmentApi;