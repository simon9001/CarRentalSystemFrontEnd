// Add to src/types/HeroTypes.ts

export interface BranchResponse {
    branch_id: number;
    branch_name: string;
    address: string;
    city: string;
    phone: string | null;
    email: string | null;
    manager_id: number | null;
    opening_hours: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    data: any;
}

export interface CreateBranchRequest {
    branch_name: string;
    address: string;
    city: string;
    phone?: string;
    email?: string;
    manager_id?: number;
    opening_hours?: string;
    is_active?: boolean;
}

export interface UpdateBranchRequest {
    branch_name?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    manager_id?: number;
    opening_hours?: string;
    is_active?: boolean;
}

export interface UpdateBranchStatusRequest {
    is_active: boolean;
}

export interface UpdateBranchManagerRequest {
    manager_id: number;
}

export interface BranchStatistics {
    branch_id: number;
    branch_name: string;
    vehicle_count: number;
    staff_count: number;
    total_bookings: number;
    active_bookings: number;
}

export interface BranchSummary {
    total_branches: number;
    active_branches: number;
    inactive_branches: number;
    cities_covered: number;
    branches_with_managers: number;
    branches_without_managers: number;
}

export interface CitySummary {
    city: string;
    branch_count: number;
    active_branches: number;
    managed_branches: number;
}