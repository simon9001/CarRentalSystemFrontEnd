// src/types/booking.ts
export interface BookingDetailsResponse {
  booking_id: number;
  pickup_date: string;
  return_date: string;
  actual_return_date: string | null;
  booking_status: string;
  rate_per_day: number;
  daily_rate_at_booking: number;
  calculated_total: number;
  discount_amount: number;
  final_total: number;
  extra_charges: number;
  created_at: string;
  customer_id: number;
  customer_username: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  vehicle_id: number;
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
  rate_per_day: number;
  coupon_id?: number;
  notes?: string;
}