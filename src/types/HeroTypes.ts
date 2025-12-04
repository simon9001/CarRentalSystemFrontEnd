// Add these interfaces to your existing types
export interface VehicleImage {
    image_id: number;
    image_url: string;
    image_type: string;
    is_primary: boolean;
    display_order: number;
    created_at: string;
}

export interface VehicleWithDetails {
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
    
    // Car model details
    make: string;
    model: string;
    year: number;
    vehicle_type: string;
    fuel_type: string;
    transmission: string;
    seating_capacity: number;
    doors: number;
    engine_size: number;
    fuel_efficiency_city: number;
    fuel_efficiency_highway: number;
    standard_features: string;
    standard_daily_rate: number;
    
    // Branch details
    branch_name: string;
    branch_city: string;
    branch_address: string;
    
    // Calculated fields
    effective_daily_rate: number;
    daily_rate_at_booking?: number;
    city?: string;
    
    // Images
    images?: VehicleImage[];
    primary_image_url?: string;
}