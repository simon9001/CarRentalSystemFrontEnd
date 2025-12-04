// Status Types
export type AccountStatus = 'Active' | 'Suspended' | 'Inactive' | 'Pending_Verification';
export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected';
export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'PayPal' | 'Bank Transfer' | 'Cash' | 'Mobile Money' | 'Other';

// Main Customer Response Interface (matches your backend)
export interface CustomerDetailsResponse {
    // From CustomerDetails table
    customer_id: number;
    national_id: string | null;
    drivers_license_number: string;
    license_expiry: string;
    license_issue_date: string | null;
    license_issuing_authority: string | null;
    account_status: AccountStatus;
    verification_status: VerificationStatus;
    verification_notes: string | null;
    loyalty_points: number;
    preferred_payment_method: PaymentMethod | null;
    marketing_opt_in: boolean;
    created_at: string;
    updated_at: string;
    
    // Joined from Users table (optional - from your JOIN query)
    username?: string;
    email?: string;
    phone_number?: string | null;
}

// Request Types for API calls - INDEPENDENT CUSTOMER DETAILS
export interface CreateCustomerDetailsRequest {
    customer_id: number;
    national_id?: string;
    drivers_license_number: string;
    license_expiry: string;
    license_issue_date?: string;
    license_issuing_authority?: string;
    account_status?: AccountStatus;
    verification_status?: VerificationStatus;
    verification_notes?: string;
    preferred_payment_method?: PaymentMethod;
    marketing_opt_in?: boolean;
    loyalty_points?: number;
}

export interface UpdateCustomerDetailsRequest {
    national_id?: string;
    drivers_license_number?: string;
    license_expiry?: string;
    license_issue_date?: string;
    license_issuing_authority?: string;
    account_status?: AccountStatus;
    verification_status?: VerificationStatus;
    verification_notes?: string;
    preferred_payment_method?: PaymentMethod;
    marketing_opt_in?: boolean;
    loyalty_points?: number;
}

export interface UpdateVerificationRequest {
    verification_status: VerificationStatus;
    verification_notes?: string;
}

export interface UpdateAccountStatusRequest {
    account_status: AccountStatus;
}

export interface UpdateLoyaltyPointsRequest {
    loyalty_points: number;
}

export interface AddLoyaltyPointsRequest {
    points_to_add: number;
}

// Statistics Types
export interface CustomerStatistics {
    total: number;
    active: number;
    suspended: number;
    verified: number;
    pending: number;
    expiredLicenses: number;
    expiringLicenses: number;
    byVerification: Record<VerificationStatus, number>;
    byAccountStatus: Record<AccountStatus, number>;
}

// Alert Types
export interface LicenseAlert {
    customer_id: number;
    username: string;
    email: string;
    drivers_license_number: string;
    license_expiry: string;
    days_until_expiry: number;
    phone_number: string | null;
}

// Filter Types
export interface CustomerFilter {
    search?: string;
    account_status?: AccountStatus;
    verification_status?: VerificationStatus;
    license_status?: 'valid' | 'expiring' | 'expired';
    marketing_opt_in?: boolean;
    page?: number;
    limit?: number;
}

// Search Results
export interface CustomerSearchResult {
    customers: CustomerDetailsResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// API Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: string;
}

export interface PaginatedApiResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
    timestamp: string;
}

// Modal State Types
export interface CustomerModalState {
    viewCustomer?: number;
    editCustomer?: number;
    verifyCustomer?: number;
    statusCustomer?: number;
    loyaltyCustomer?: number;
    deleteCustomer?: number;
}

// Component Props Types
export interface CustomerOverviewProps {
    customers: CustomerDetailsResponse[];
    isLoading: boolean;
    error: any;
    onViewCustomer: (id: number) => void;
    onEditCustomer: (id: number) => void;
    onVerifyCustomer: (id: number) => void;
    onStatusCustomer: (id: number) => void;
    onLoyaltyCustomer: (id: number) => void;
    onDeleteCustomer?: (id: number) => void;
}

export interface CustomerCardProps {
    customer: CustomerDetailsResponse;
    onView: () => void;
    onEdit: () => void;
    onVerify: () => void;
    onStatus: () => void;
    onLoyalty: () => void;
    onDelete: () => void;
    compact?: boolean;
}

// Utility Types
export type SortField = 'customer_id' | 'drivers_license_number' | 'created_at' | 'loyalty_points' | 'license_expiry';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

// Form Types for Customer Details Only
export interface CustomerDetailsFormData {
    // Customer Details Section
    customer_id: number;
    national_id: string;
    drivers_license_number: string;
    license_expiry: string;
    license_issue_date: string;
    license_issuing_authority: string;
    account_status: AccountStatus;
    verification_status: VerificationStatus;
    verification_notes: string;
    preferred_payment_method: PaymentMethod;
    marketing_opt_in: boolean;
    loyalty_points: number;
}

// Partial form for updates
export interface CustomerDetailsUpdateFormData {
    national_id?: string;
    drivers_license_number?: string;
    license_expiry?: string;
    license_issue_date?: string;
    license_issuing_authority?: string;
    account_status?: AccountStatus;
    verification_status?: VerificationStatus;
    verification_notes?: string;
    preferred_payment_method?: PaymentMethod;
    marketing_opt_in?: boolean;
    loyalty_points?: number;
}

// Validation Error Type
export interface ValidationErrors {
    [key: string]: string;
}

// Quick Action Types
export interface QuickAction {
    id: string;
    label: string;
    icon: string;
    description: string;
    action: (customerId: number) => Promise<void>;
    color: string;
}

// Combined User and Customer Details (if needed separately)
export interface CombinedCustomerUser {
    // User data
    user_id: number;
    username: string;
    email: string;
    phone_number?: string;
    address?: string;
    role: string;
    is_active: boolean;
    
    // Customer details data
    customer_id: number;
    national_id: string | null;
    drivers_license_number: string;
    license_expiry: string;
    account_status: AccountStatus;
    verification_status: VerificationStatus;
    loyalty_points: number;
}

// Export all types for easy import
export type {
    CustomerDetailsResponse as Customer,
    CreateCustomerDetailsRequest as NewCustomerDetails,
    UpdateCustomerDetailsRequest as CustomerUpdateDetails,
    UpdateVerificationRequest as VerificationUpdate,
    UpdateAccountStatusRequest as StatusUpdate,
    UpdateLoyaltyPointsRequest as LoyaltyUpdate,
    AddLoyaltyPointsRequest as AddLoyaltyPoints,
};