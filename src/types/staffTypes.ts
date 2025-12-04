// types/staffTypes.ts
export interface Staff {
    staff_id: number;
    branch_id: number | null;
    employee_id: string;
    hire_date: string;
    termination_date: string | null;
    job_title: string | null;
    department: string | null;
    salary: number | null;
    employment_type: string;
    permissions: string | null;
    assigned_vehicles: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    username: string;
    email: string;
    phone_number: string | null;
    branch_name: string | null;
    is_active?: boolean;
    last_login?: string | null;
  }
  
  export interface StaffOverview {
    total_staff: number;
    data:any; // Added to avoid error, please specify correct type if needed
    staff_by_branch: Array<{
      branch_name: string;
      staff_count: number;
    }>;
    staff_by_job_title: Array<{
      job_title: string;
      staff_count: number;
    }>;
    staff_status: {
      active_staff: number;
      inactive_staff: number;
    };
  }
  
  export interface StaffListResponse {
    data: {
      staff: Staff[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
      };
    };
    success: boolean;
  }