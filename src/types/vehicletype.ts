// src/types/HeroTypes.ts
export interface VehicleResponse {
    vehicle_id: number;
    model_id: number;
    registration_number: string;
    color: string;
    vin_number: string;
    current_mileage: number;
    status: string;
    branch_id: number | null;
    insurance_expiry_date: string | null;
    service_due_date: string | null;
    actual_daily_rate: number | null;
    custom_features: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface VehicleImage {
    image_id: number;
    image_url: string;
    image_type: string;
    is_primary: boolean;
    display_order: number;
    created_at: string;
}

export interface CarModel {
    model_id: number;
    make: string;
    model: string;
    year: number;
    vehicle_type: string;
    fuel_type: string;
    transmission: string;
    seating_capacity: number;
    doors: number;
    engine_size?: number;
    fuel_efficiency_city?: number;
    fuel_efficiency_highway?: number;
    standard_features?: string;
    standard_daily_rate: number;
    is_active: boolean;
}

export interface Branch {
    branch_id: number;
    branch_name: string;
    city: string;
    address?: string;
    is_active: boolean;
}

export interface VehicleWithDetails extends VehicleResponse {
    make: string;
    model: string;
    year: number;
    vehicle_type: string;
    fuel_type: string;
    transmission: string;
    seating_capacity: number;
    doors: number;
    engine_size?: number;
    fuel_efficiency_city?: number;
    fuel_efficiency_highway?: number;
    standard_features?: string;
    standard_daily_rate: number;
    branch_name?: string;
    branch_city?: string;
    branch_address?: string;
    effective_daily_rate: number;
    daily_rate_at_booking?: number;
    images: VehicleImage[];
    primary_image_url?: string;
}

export interface VehicleListing {
    vehicle_id: number;
    model_id: number;
    registration_number: string;
    color: string;
    current_mileage: number;
    status: string;
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
    primary_image_url?: string;
}

export interface VehicleStatistics {
    total_vehicles: number;
    available_vehicles: number;
    booked_vehicles: number;
    maintenance_vehicles: number;
    retired_vehicles: number;
    overdue_service: number;
    expired_insurance: number;
    average_daily_rate: number;
}

export interface ServiceDueVehicle extends VehicleListing {
    days_until_service: number;
    service_due_date: string;
}

export interface InsuranceExpiringVehicle extends VehicleListing {
    days_until_insurance_expiry: number;
    insurance_expiry_date: string;
}

export interface CreateVehicleRequest {
    model_id: number;
    registration_number: string;
    color: string;
    vin_number: string;
    current_mileage: number;
    branch_id?: number;
    insurance_expiry_date?: string;
    service_due_date?: string;
    actual_daily_rate?: number;
    custom_features?: string;
    notes?: string;
}

export interface UpdateVehicleRequest {
    model_id: number;
    registration_number: string;
    color: string;
    vin_number: string;
    current_mileage: number;
    status: string;
    branch_id?: number;
    insurance_expiry_date?: string;
    service_due_date?: string;
    actual_daily_rate?: number;
    custom_features?: string;
    notes?: string;
}

export interface UpdateVehicleStatusRequest {
    status: string;
}

export interface UpdateVehicleMileageRequest {
    current_mileage: number;
}

export interface UpdateVehicleBranchRequest {
    branch_id: number;
}

export interface UpdateVehicleDailyRateRequest {
    actual_daily_rate: number;
}

export interface AddVehicleImageRequest {
    image_url: string;
    image_type: string;
    is_primary?: boolean;
    display_order?: number;
    cloudinary_public_id?: string;
}