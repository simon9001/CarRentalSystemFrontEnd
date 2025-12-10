// types/vehicle.ts
export interface Vehicle {
  vehicle_id: number;
  model_id: number;
  registration_number: string;
  color: string;
  current_mileage: number;
  status: string;
  branch_id: number;
  insurance_expiry_date: string | null;
  service_due_date: string | null;
  actual_daily_rate: number | null;
  custom_features: string | null;
  notes: string | null;
  updated_at: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_type: string;
  transmission: string;
  seating_capacity: number;
  doors: number;
  standard_daily_rate: number;
  branch_name: string;
  branch_city: string;
  effective_daily_rate: number;
  images: VehicleImage[];
}

export interface VehicleImage {
  image_id: number;
  image_url: string;
  image_type: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface VehicleListing {
  vehicle_id: number;
  model_id: number;
  registration_number: string;
  color: string;
  current_mileage: number;
  status: 'Available' | 'Booked' | 'Under Maintenance' | 'Retired';
  daily_rate_at_booking: number;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_type: string;
  transmission: string;
  seating_capacity: number;
  branch_name: string;
  city: string;
  primary_image_url: string | null;
}

export interface VehicleFilters {
  vehicle_type?: string;
  branch_id?: number;
  min_price?: number;
  max_price?: number;
  transmission?: string;
  seating_capacity?: number;
  fuel_type?: string;
  make?: string;
  year?: number;
  status?: string;
}