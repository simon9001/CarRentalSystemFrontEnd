// Add to src/types/HeroTypes.ts

export interface CarModelResponse {
    model_id: number;
    make: string;
    model: string;
    year: number;
    vehicle_type: string;
    fuel_type: string;
    transmission: string;
    seating_capacity: number;
    doors: number;
    engine_size: string | null;
    fuel_efficiency_city: number | null;
    fuel_efficiency_highway: number | null;
    standard_features: string | null;
    standard_daily_rate: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateCarModelRequest {
    make: string;
    model: string;
    year: number;
    vehicle_type: string;
    fuel_type: string;
    transmission: string;
    seating_capacity: number;
    doors: number;
    standard_daily_rate: number;
    engine_size?: string;
    fuel_efficiency_city?: number;
    fuel_efficiency_highway?: number;
    standard_features?: string;
    is_active?: boolean;
}

export interface UpdateCarModelRequest {
    make: string;
    model: string;
    year: number;
    vehicle_type: string;
    fuel_type: string;
    transmission: string;
    seating_capacity: number;
    doors: number;
    standard_daily_rate: number;
    engine_size?: string;
    fuel_efficiency_city?: number;
    fuel_efficiency_highway?: number;
    standard_features?: string;
    is_active?: boolean;
}

export interface UpdateCarModelStatusRequest {
    is_active: boolean;
}

export interface UpdateCarModelDailyRateRequest {
    standard_daily_rate: number;
}

// Add these type definitions
export type VehicleType = 
    | 'Sedan' 
    | 'SUV' 
    | 'Truck' 
    | 'Van' 
    | 'Coupe' 
    | 'Convertible' 
    | 'Hatchback' 
    | 'Electric' 
    | 'Hybrid';

export type FuelType = 
    | 'Gasoline' 
    | 'Diesel' 
    | 'Electric' 
    | 'Hybrid' 
    | 'Plug-in Hybrid';

export type TransmissionType = 
    | 'Automatic' 
    | 'Manual' 
    | 'CVT' 
    | 'Semi-Automatic';