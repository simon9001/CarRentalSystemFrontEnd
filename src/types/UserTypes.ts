// src/types/UserTypes.ts
export interface UserResponse {
    user_id: number;
    username: string;
    email: string;
    password_hash: string;
    password_salt: string;
    phone_number: string | null;
    address: string | null;
    role: string;
    is_active: boolean;
    is_email_verified: boolean;
    is_phone_verified: boolean;
    failed_login_attempts: number;
    lockout_end: string | null;
    last_login: string | null;
    password_changed_at: string;
    mfa_secret: string | null;
    mfa_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    password_hash: string;
    password_salt: string;
    phone_number?: string;
    address?: string;
    role?: string;
}

export interface UpdateUserRequest {
    username: string;
    email: string;
    phone_number?: string;
    address?: string;
    role?: string;
}

export interface UpdatePasswordRequest {
    password_hash: string;
    password_salt: string;
}

export interface UpdateVerificationRequest {
    is_email_verified?: boolean;
    is_phone_verified?: boolean;
}

export interface UpdateMFARequest {
    mfa_secret?: string;
    mfa_enabled?: boolean;
}

export interface UpdateStatusRequest {
    is_active: boolean;
}

export interface UserStatistics {
    total: number;
    active: number;
    inactive: number;
    verified: number;
    pending: number;
    locked: number;
    byRole: Record<string, number>;
}

export type UserRole = 'Customer' | 'Admin' | 'Manager' | 'Agent';