// src/features/Api/BookingApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiDomain } from '../../apiDomain/ApiDomain';

// =============================================
// TYPE DEFINITIONS
// =============================================

export interface Booking {
  booking_id: number;
  customer_id: number;
  vehicle_id: number;
  model_id: number;
  pickup_date: string;
  return_date: string;
  actual_return_date: string | null;
  pickup_branch_id: number | null;
  return_branch_id: number | null;
  rate_per_day: number;
  daily_rate_at_booking: number;
  booking_status: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled' | 'Overdue';
  payment_status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  calculated_total: number;
  discount_amount: number;
  final_total: number;
  extra_charges: number;
  cancellation_reason: string | null;
  vehicle_features_at_booking: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingDetails extends Booking {
  customer_username: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  registration_number: string;
  color: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  pickup_branch_name: string | null;
  pickup_city: string | null;
  return_branch_name: string | null;
  return_city: string | null;
  coupon_code: string | null;
  coupon_discount_type: string | null;
}

export interface Payment {
  payment_id: number;
  booking_id: number;
  amount: number;
  payment_method: string;
  transaction_code: string | null;
  payment_date: string | null;
  payment_status: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Partially_Refunded';
  refund_amount: number;
}

export interface BookingStatistics {
  status_counts: {
    pending: number;
    confirmed: number;
    active: number;
    completed: number;
    cancelled: number;
    overdue: number;
  };
  total_bookings: number;
  total_revenue: number;
  average_booking_value: number;
  unique_customers: number;
  active_bookings: number;
  upcoming_bookings: number;
  recent_bookings: number;
}

export interface CreateBookingRequest {
  customer_id: number;
  vehicle_id: number;
  model_id: number;
  pickup_date: string;
  return_date: string;
  pickup_branch_id?: number;
  return_branch_id?: number;
  rate_per_day?: number;
  coupon_id?: number;
  notes?: string;
  payment_method?: string;
}

export interface BookingResponse {
  booking: Booking;
  payment: Payment;
  next_step: string;
}

export interface AvailabilityResponse {
  success: boolean;
  data: {
    available: boolean;
    vehicle_id: number;
    pickup_date: string;
    return_date: string;
  };
}

export interface EmailReceiptData {
  customer_email: string;
  customer_name: string;
  booking_id: number;
  transaction_code: string;
  amount: number;
  vehicle: string;
  pickup_date: string;
  return_date: string;
  rental_days: number;
  payment_method: string;
}

export interface CompletePaymentRequest {
  paymentId: number;
  transactionCode: string;
}

export interface CompletePaymentResponse {
  data: {
    booking: Booking;
    payment: Payment;
  };
}

export interface UpdateBookingStatusRequest {
  bookingId: number;
  bookingStatus: Booking['booking_status'];
}

export interface UpdateActualReturnDateRequest {
  bookingId: number;
  actualReturnDate: string;
}

export interface UpdateBookingTotalsRequest {
  bookingId: number;
  calculatedTotal: number;
  discountAmount: number;
  finalTotal: number;
  extraCharges: number;
}

export interface CancelBookingRequest {
  bookingId: number;
  cancellationReason?: string;
}

export interface CompleteBookingReturnRequest {
  bookingId: number;
  actualReturnDate?: string;
  mileageAdded?: number;
}

export interface CheckVehicleAvailabilityParams {
  vehicleId: number;
  pickupDate: string;
  returnDate: string;
  excludeBookingId?: number;
}

export interface BookingsByDateRangeParams {
  startDate: string;
  endDate: string;
}

// Backend response wrapper types
interface BackendResponse<T> {
  success: boolean;
  data: T;
}

interface BackendError {
  success: boolean;
  error?: string;
  message?: string;
}

// =============================================
// API DEFINITION
// =============================================

export const BookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${apiDomain}/`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Booking', 'BookingStats', 'Payment'],
  endpoints: (builder) => ({
    // =============================================
    // BOOKING QUERIES (GET REQUESTS)
    // =============================================

    getAllBookings: builder.query<BookingDetails[], void>({
      query: () => '/bookings/get',
      transformResponse: (response: BackendResponse<BookingDetails[]>) => response.data,
      providesTags: ['Booking'],
    }),

    getBookingById: builder.query<BookingDetails, number>({
      query: (id) => `/bookings/${id}`,
      transformResponse: (response: BackendResponse<BookingDetails>) => response.data,
      providesTags: ['Booking'],
    }),

    getBookingsByCustomer: builder.query<BookingDetails[], number>({
      query: (customerId) => `/bookings/customer/${customerId}`,
      transformResponse: (response: BackendResponse<BookingDetails[]>) => response.data,
      providesTags: ['Booking'],
    }),

    getBookingsByVehicle: builder.query<BookingDetails[], number>({
      query: (vehicleId) => `/bookings/vehicle/${vehicleId}`,
      transformResponse: (response: BackendResponse<BookingDetails[]>) => response.data,
      providesTags: ['Booking'],
    }),

    getBookingsByStatus: builder.query<BookingDetails[], string>({
      query: (status) => `/bookings/status/${status}`,
      transformResponse: (response: BackendResponse<BookingDetails[]>) => response.data,
      providesTags: ['Booking'],
    }),

    getActiveBookings: builder.query<BookingDetails[], void>({
      query: () => '/bookings/status/active',
      transformResponse: (response: BackendResponse<BookingDetails[]>) => response.data,
      providesTags: ['Booking'],
    }),

    getBookingsByDateRange: builder.query<BookingDetails[], BookingsByDateRangeParams>({
      query: ({ startDate, endDate }) => 
        `/bookings/date-range?start_date=${startDate}&end_date=${endDate}`,
      transformResponse: (response: BackendResponse<BookingDetails[]>) => response.data,
      providesTags: ['Booking'],
    }),

    getTodaysPickups: builder.query<BookingDetails[], void>({
      query: () => '/bookings/today/pickups',
      transformResponse: (response: BackendResponse<BookingDetails[]>) => response.data,
      providesTags: ['Booking'],
    }),

    getTodaysReturns: builder.query<BookingDetails[], void>({
      query: () => '/bookings/today/returns',
      transformResponse: (response: BackendResponse<BookingDetails[]>) => response.data,
      providesTags: ['Booking'],
    }),

    getOverdueReturns: builder.query<BookingDetails[], void>({
      query: () => '/bookings-overduepayssssz', // Fixed endpoint - check with your backend
      transformResponse: (response: BackendResponse<BookingDetails[]>) => response.data,
      providesTags: ['Booking'],
    }),

    getBookingStatistics: builder.query<BookingStatistics, void>({
      query: () => '/bookings/statistics/summary',
      transformResponse: (response: BackendResponse<BookingStatistics>) => response.data,
      providesTags: ['BookingStats'],
    }),

    checkVehicleAvailability: builder.query<AvailabilityResponse, CheckVehicleAvailabilityParams>({
      query: ({ vehicleId, pickupDate, returnDate, excludeBookingId }) => {
        const params = new URLSearchParams({
          pickup_date: pickupDate,
          return_date: returnDate
        });
        if (excludeBookingId) {
          params.append('exclude_booking_id', excludeBookingId.toString());
        }
        return `/bookings/availability/vehicle/${vehicleId}?${params.toString()}`;
      },
      transformResponse: (response: BackendResponse<AvailabilityResponse['data']>) => ({
        success: true,
        data: response.data
      }),
    }),

    getBookingPaymentDetails: builder.query<Payment[], number>({
      query: (bookingId) => `/bookings/${bookingId}/payment-details`,
      transformResponse: (response: BackendResponse<Payment[]>) => response.data,
      providesTags: ['Booking', 'Payment'],
    }),

    // =============================================
    // BOOKING & PAYMENT MUTATIONS (POST/PATCH REQUESTS)
    // =============================================

    // New booking with payment flow
    initiateBookingWithPayment: builder.mutation<BookingResponse, CreateBookingRequest>({
      query: (bookingData) => ({
        url: '/bookings/initiate',
        method: 'POST',
        body: bookingData,
      }),
      transformResponse: (response: BackendResponse<BookingResponse>) => response.data,
      invalidatesTags: ['Booking'],
    }),

    completePayment: builder.mutation<CompletePaymentResponse, CompletePaymentRequest>({
      query: ({ paymentId, transactionCode }) => ({
        url: `/payments/${paymentId}/complete`,
        method: 'POST',
        body: { transaction_code: transactionCode },
      }),
      transformResponse: (response: BackendResponse<CompletePaymentResponse['data']>) => ({
        data: response.data
      }),
      invalidatesTags: ['Booking', 'Payment', 'BookingStats'],
    }),

    handlePaymentFailure: builder.mutation<{ success: boolean }, number>({
      query: (paymentId) => ({
        url: `/payments/${paymentId}/fail`,
        method: 'POST',
      }),
      transformResponse: (response: BackendResponse<{ success: boolean }>) => response.data,
      invalidatesTags: ['Booking', 'Payment'],
    }),

    // Legacy booking creation
    createBooking: builder.mutation<Booking, CreateBookingRequest>({
      query: (bookingData) => ({
        url: '/bookings',
        method: 'POST',
        body: bookingData,
      }),
      transformResponse: (response: BackendResponse<Booking>) => response.data,
      invalidatesTags: ['Booking', 'BookingStats'],
    }),

    updateBookingStatus: builder.mutation<Booking, UpdateBookingStatusRequest>({
      query: ({ bookingId, bookingStatus }) => ({
        url: `/bookings/${bookingId}/status`,
        method: 'PATCH',
        body: { booking_status: bookingStatus },
      }),
      transformResponse: (response: BackendResponse<Booking>) => response.data,
      invalidatesTags: ['Booking', 'BookingStats'],
    }),

    updateActualReturnDate: builder.mutation<Booking, UpdateActualReturnDateRequest>({
      query: ({ bookingId, actualReturnDate }) => ({
        url: `/bookings/${bookingId}/return-date`,
        method: 'PATCH',
        body: { actual_return_date: actualReturnDate },
      }),
      transformResponse: (response: BackendResponse<Booking>) => response.data,
      invalidatesTags: ['Booking', 'BookingStats'],
    }),

    updateBookingTotals: builder.mutation<Booking, UpdateBookingTotalsRequest>({
      query: ({ bookingId, calculatedTotal, discountAmount, finalTotal, extraCharges }) => ({
        url: `/bookings/${bookingId}/totals`,
        method: 'PATCH',
        body: {
          calculated_total: calculatedTotal,
          discount_amount: discountAmount,
          final_total: finalTotal,
          extra_charges: extraCharges
        },
      }),
      transformResponse: (response: BackendResponse<Booking>) => response.data,
      invalidatesTags: ['Booking'],
    }),

    cancelBooking: builder.mutation<Booking, CancelBookingRequest>({
      query: ({ bookingId, cancellationReason }) => ({
        url: `/bookings/${bookingId}/cancel`,
        method: 'PATCH',
        body: { cancellation_reason: cancellationReason },
      }),
      transformResponse: (response: BackendResponse<Booking>) => response.data,
      invalidatesTags: ['Booking', 'BookingStats'],
    }),

    activateBooking: builder.mutation<Booking, number>({
      query: (bookingId) => ({
        url: `/bookings/${bookingId}/activate`,
        method: 'PATCH',
      }),
      transformResponse: (response: BackendResponse<Booking>) => response.data,
      invalidatesTags: ['Booking'],
    }),

    sendPaymentReceipt: builder.mutation<{ success: boolean; message: string }, any>({
      query: (emailData) => ({
        url: '/send-payment-receipt',
        method: 'POST',
        body: emailData,
      }),
      transformResponse: (response: BackendResponse<{ success: boolean; message: string }>) => response.data,
    }),

    completeBookingReturn: builder.mutation<Booking, CompleteBookingReturnRequest>({
      query: ({ bookingId, actualReturnDate, mileageAdded }) => ({
        url: `/bookings/${bookingId}/complete`,
        method: 'PATCH',
        body: {
          actual_return_date: actualReturnDate,
          mileage_added: mileageAdded || 0
        },
      }),
      transformResponse: (response: BackendResponse<Booking>) => response.data,
      invalidatesTags: ['Booking', 'BookingStats'],
    }),
  }),
});

export const { 
  // Queries
  useGetAllBookingsQuery,
  useGetBookingByIdQuery,
  useGetBookingsByCustomerQuery,
  useGetBookingsByVehicleQuery,
  useGetBookingsByStatusQuery,
  useGetActiveBookingsQuery,
  useGetBookingsByDateRangeQuery,
  useGetTodaysPickupsQuery,
  useGetTodaysReturnsQuery,
  useGetOverdueReturnsQuery,
  useGetBookingStatisticsQuery,
  useCheckVehicleAvailabilityQuery,
  useGetBookingPaymentDetailsQuery,
  
  // Mutations
  useInitiateBookingWithPaymentMutation,
  useCompletePaymentMutation,
  useHandlePaymentFailureMutation,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
  useUpdateActualReturnDateMutation,
  useUpdateBookingTotalsMutation,
  useCancelBookingMutation,
  useActivateBookingMutation,
  useCompleteBookingReturnMutation,
  useSendPaymentReceiptMutation,
} = BookingApi;