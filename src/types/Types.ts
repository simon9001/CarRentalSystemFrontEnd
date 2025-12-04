// types/Types.ts

// =============================================
// COMMON & BASE TYPES
// =============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}



// =============================================
// AUTHENTICATION & USER MANAGEMENT TYPES
// =============================================

export type UserRole = 'Customer' | 'Admin' | 'Manager' | 'Agent';
export type Gender = 'Male' | 'Female' | 'Other';
export type AccountStatus = 'Active' | 'Suspended' | 'Inactive' | 'Pending_Verification';
export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected';
export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract';

export interface UserFormValues {
  username: string;
  email: string;
  password?: string;
  phone_number?: string;
  address?: string;
  role?: UserRole;
}

export interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  phone_number?: string;
  address?: string;
  role?: UserRole;
}

export interface UserProfileFormValues {
  full_name: string;
  date_of_birth?: string;
  gender?: Gender;
  profile_picture?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_language?: string;
  notification_preferences?: string;
}

export interface CustomerDetailsFormValues {
  national_id?: string;
  drivers_license_number: string;
  license_expiry: string;
  license_issue_date?: string;
  license_issuing_authority?: string;
  preferred_payment_method?: string;
  marketing_opt_in?: boolean;
}

// =============================================
// USER & STAFF ENTITY TYPES
// =============================================

export interface User {
  user_id: number;
  username: string;
  email: string;
  phone_number?: string;
  address?: string;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  profile_id: number;
  user_id: number;
  full_name: string;
  date_of_birth?: string;
  gender?: Gender;
  profile_picture?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_language?: string;
  notification_preferences?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerDetails {
  customer_id: number;
  national_id?: string;
  drivers_license_number: string;
  license_expiry: string;
  license_issue_date?: string;
  license_issuing_authority?: string;
  account_status: AccountStatus;
  verification_status: VerificationStatus;
  verification_notes?: string;
  loyalty_points: number;
  preferred_payment_method?: string;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffDetails {
  staff_id: number;
  branch_id?: number;
  employee_id: string;
  hire_date: string;
  termination_date?: string;
  job_title?: string;
  department?: string;
  salary?: number;
  employment_type?: EmploymentType;
  permissions?: string;
  assigned_vehicles?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithDetails extends User {
  profile?: UserProfile;
  customer_details?: CustomerDetails;
  staff_details?: StaffDetails;
  branch_name?: string;
  branch_city?: string;
}

// =============================================
// BRANCH & LOCATION TYPES
// =============================================

export interface Branch {
  branch_id: number;
  branch_name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  manager_id?: number;
  opening_hours?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// VEHICLE MANAGEMENT TYPES
// =============================================

export type VehicleType = 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Minivan' | 'Pickup' | 'Luxury';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG';
export type Transmission = 'Manual' | 'Automatic' | 'Semi-Automatic';
export type VehicleStatus = 'Available' | 'Booked' | 'Under Maintenance' | 'Retired';
export type ImageType = 'exterior' | 'interior' | 'dashboard' | 'engine' | 'trunk';

export interface CarModel {
  model_id: number;
  make: string;
  model: string;
  year: number;
  vehicle_type: VehicleType;
  fuel_type: FuelType;
  transmission: Transmission;
  seating_capacity: number;
  doors: number;
  engine_size?: string;
  fuel_efficiency_city?: number;
  fuel_efficiency_highway?: number;
  standard_features?: string;
  standard_daily_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarModelImage {
  image_id: number;
  model_id: number;
  image_url: string;
  image_type: ImageType;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Vehicle {
  vehicle_id: number;
  model_id: number;
  registration_number: string;
  color: string;
  vin_number: string;
  current_mileage: number;
  status: VehicleStatus;
  branch_id?: number;
  insurance_expiry_date?: string;
  service_due_date?: string;
  actual_daily_rate?: number;
  custom_features?: string;
  images?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleWithDetails extends Vehicle {
  make: string;
  model: string;
  year: number;
  vehicle_type: VehicleType;
  fuel_type: FuelType;
  transmission: Transmission;
  seating_capacity: number;
  standard_daily_rate: number;
  branch_name?: string;
  branch_city?: string;
  branch_address?: string;
  daily_rate: number;
}

// =============================================
// BOOKING & RESERVATION TYPES
// =============================================

export type BookingStatus = 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
export type DiscountType = 'percentage' | 'flat';
export type CustomerScope = 'all' | 'new' | 'existing';

export interface BookingFormValues {
  customer_id: number;
  vehicle_id: number;
  model_id: number;
  pickup_date: string;
  return_date: string;
  pickup_branch_id?: number;
  return_branch_id?: number;
  rate_per_day: number;
  daily_rate_at_booking: number;
  discount_amount?: number;
  coupon_id?: number;
  vehicle_features_at_booking?: string;
}

export interface Coupon {
  coupon_id: number;
  code: string;
  description?: string;
  discount_type: DiscountType;
  value: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  used_count: number;
  minimum_booking_amount: number;
  max_discount_amount?: number;
  customer_scope: CustomerScope;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Booking {
  booking_id: number;
  customer_id: number;
  vehicle_id: number;
  model_id: number;
  pickup_date: string;
  return_date: string;
  actual_return_date?: string;
  pickup_branch_id?: number;
  return_branch_id?: number;
  booking_status: BookingStatus;
  rate_per_day: number;
  daily_rate_at_booking: number;
  calculated_total: number;
  discount_amount: number;
  final_total: number;
  extra_charges: number;
  coupon_id?: number;
  vehicle_features_at_booking?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  customer_username?: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  registration_number?: string;
  color?: string;
  make?: string;
  model?: string;
  year?: number;
  vehicle_type?: VehicleType;
  pickup_branch_name?: string;
  pickup_city?: string;
  return_branch_name?: string;
  return_city?: string;
  coupon_code?: string;
  coupon_discount_type?: DiscountType;
}

// =============================================
// PAYMENT & FINANCIAL TYPES
// =============================================

export type PaymentMethod = 'Mpesa' | 'Cash' | 'Card' | 'Bank Transfer';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Partially_Refunded';
export type RuleType = 'weekend' | 'season' | 'holiday' | 'custom' | 'peak';
export type ApplicableVehicles = 'all' | 'specific';

export interface Payment {
  payment_id: number;
  booking_id: number;
  amount: number;
  payment_method: PaymentMethod;
  transaction_code?: string;
  payment_date: string;
  payment_status: PaymentStatus;
  refund_amount: number;
}

export interface PricingRule {
  rule_id: number;
  name: string;
  rule_type: RuleType;
  start_date?: string;
  end_date?: string;
  day_of_week?: number;
  percentage_increase: number;
  flat_amount_add: number;
  min_rental_days: number;
  applicable_vehicles: ApplicableVehicles;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// =============================================
// MAINTENANCE & INSURANCE TYPES
// =============================================

export type ServiceStatus = 'Completed' | 'Scheduled' | 'In Progress';
export type InsuranceType = 'Comprehensive' | 'Third-Party';
export type DamageStatus = 'Reported' | 'Assessed' | 'Repaired' | 'Closed';

export interface ServiceRecord {
  service_id: number;
  vehicle_id: number;
  service_type: string;
  service_date: string;
  service_cost: number;
  description?: string;
  next_service_date?: string;
  status: ServiceStatus;
  performed_by?: string;
  created_at: string;
}

export interface Insurance {
  insurance_id: number;
  vehicle_id: number;
  provider: string;
  policy_number: string;
  start_date: string;
  expiry_date: string;
  insurance_type: InsuranceType;
  premium_amount: number;
  coverage_details?: string;
  created_at: string;
}

// =============================================
// INCIDENT & REVIEW TYPES
// =============================================

export interface DamageReport {
  incident_id: number;
  booking_id: number;
  vehicle_id: number;
  customer_id: number;
  incident_description: string;
  damage_cost: number;
  date_recorded: string;
  resolved_date?: string;
  status: DamageStatus;
  photos?: string;
}

export interface Review {
  review_id: number;
  booking_id: number;
  customer_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// DASHBOARD & ANALYTICS TYPES
// =============================================

export interface AdminDashboardStats {
  totalUsers: number;
  totalVehicles: number;
  totalBookings: number;
  activeBookings: number;
  revenue: number;
  availableVehicles: number;
  maintenanceVehicles: number;
  pendingVerifications: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user_id?: number;
  username?: string;
}

export interface BookingAnalytics {
  date: string;
  bookings: number;
  revenue: number;
}

export interface VehicleStatusSummary {
  status: VehicleStatus;
  count: number;
}

export interface UserRoleSummary {
  role: UserRole;
  count: number;
}

export interface BranchPerformance {
  branch_id: number;
  branch_name: string;
  total_bookings: number;
  total_revenue: number;
  available_vehicles: number;
}

export interface PopularCarModel {
  model_id: number;
  make: string;
  model: string;
  year: number;
  booking_count: number;
  total_revenue: number;
}

export interface SystemHealth {
  database_size: string;
  active_sessions: number;
  avg_response_time: number;
  error_rate: number;
}

// In your Types.ts file
export interface DashboardData {
  stats?: AdminDashboardStats;
  activities?: RecentActivity[];
  popularModels?: PopularCarModel[];
  branchPerformance?: BranchPerformance[];
  vehicleSummary?: VehicleStatusSummary[];
  systemHealth?: SystemHealth;
  // Add other properties from your backend response
  analytics?: BookingAnalytics[];
  userSummary?: UserRoleSummary[];
  // etc.
}

export interface CustomerStats {
  totalBookings: number;
  totalSpent: number;
  loyaltyPoints: number;
  favoriteVehicleType?: string;
}

// =============================================
// LEGACY TYPES (for backward compatibility)
// =============================================

// These can be removed once all components are updated to use the new types
export interface RecentBooking {
  id: number;
  customer: string;
  vehicle: string;
  amount: number;
  status: BookingStatus;
  time: string;
}


// Add to your existing Types.ts file

// =============================================
// CUSTOMER DASHBOARD TYPES
// =============================================

export interface CustomerDashboardStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalSpent: number;
  loyaltyPoints: number;
  favoriteVehicleType?: string;
  upcomingBookings: number;
}

export interface CustomerBooking {
  booking_id: number;
  vehicle_id: number;
  make: string;
  model: string;
  year: number;
  pickup_date: string;
  return_date: string;
  actual_return_date?: string;
  booking_status: string;
  final_total: number;
  pickup_branch_name: string;
  return_branch_name?: string;
  registration_number: string;
  color: string;
}

export interface CustomerLoyaltyInfo {
  loyalty_points: number;
  points_earned_this_month: number;
  next_reward_threshold: number;
  reward_tier: string;
}

export interface UpcomingBooking {
  booking_id: number;
  pickup_date: string;
  return_date: string;
  vehicle_name: string;
  branch_name: string;
  total_amount: number;
}

export interface VehicleRecommendation {
  vehicle_id: number;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  daily_rate: number;
  recommended_reason: string;
}

export interface CustomerActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  booking_id?: number;
}

export interface CustomerDashboardData {
  stats: CustomerDashboardStats;
  recentBookings: CustomerBooking[];
  loyaltyInfo: CustomerLoyaltyInfo;
  upcomingBookings: UpcomingBooking[];
  recommendations: VehicleRecommendation[];
  recentActivity: CustomerActivity[];
}




// types/Types.ts

// Add this interface for the API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T    
  message?: string;
}

// Update your CustomerDashboardData to represent the actual data structure
export interface CustomerDashboardData {
  stats: CustomerDashboardStats;
  recentBookings: CustomerBooking[];
  loyaltyInfo: CustomerLoyaltyInfo;
  upcomingBookings: UpcomingBooking[];
  recommendations: VehicleRecommendation[];
  recentActivity: CustomerActivity[];
}

// The rest of your existing types remain the same


export interface CustomerLoyaltyInfo {
  loyalty_points: number;
  points_earned_this_month: number;
  next_reward_threshold: number;
  reward_tier: string;
}

export interface UpcomingBooking {
  booking_id: number;
  pickup_date: string;
  return_date: string;
  vehicle_name: string;
  branch_name: string;
  total_amount: number;
}

export interface VehicleRecommendation {
  vehicle_id: number;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  daily_rate: number;
  recommended_reason: string;
}

