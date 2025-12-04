import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain';

// Define TypeScript interfaces for query parameters
interface GetAllStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  branch?: string;
  job_title?: string;
  employment_type?: string;
  status?: string;
}

interface GetActivityLogsParams {
  page?: number;
  limit?: number;
  staff_id?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

interface GetStaffOverviewParams {
  period?: string;
  branch_id?: number;
  [key: string]: any;
}

interface StaffDetails {
  staff_id: number;
  username: string;
  full_name?: string;
  email: string;
  phone_number?: string;
  employee_id: string;
  job_title?: string;
  department?: string;
  branch_name?: string;
  employment_type: string;
  salary: number;
  hire_date: string;
  termination_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface StaffOverview {
  active_staff: number;
  full_time: number;
  total_departments: number;
  active_branches: number;
  total_staff: number;
  terminated_staff: number;
  avg_salary: number;
  part_time?: number;
  contract?: number;
}

interface StaffFilters {
  branches: string[];
  job_titles: string[];
  departments: string[];
  employment_types: string[];
}

export const staffApi = createApi({
  reducerPath: 'staffApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${apiDomain}`,
  }),
  tagTypes: ['Staff', 'StaffStats', 'StaffOverview', 'ActivityLog'],
  endpoints: (builder) => ({
    // =============================================
    // STAFF QUERIES (GET REQUESTS)
    // =============================================

    // ➤ Get all active staff (for manager assignment)
    getActiveStaff: builder.query<StaffDetails[], void>({
      query: () => '/staff-details/status/active',
      providesTags: ['Staff'],
      transformResponse: (response: ApiResponse<StaffDetails[]>) => {
        if (response.success && response.data) {
          return response.data;
        }
        return response as any;
      }
    }),

    // ➤ Get staff by branch (for branch-specific staff)
    getStaffByBranch: builder.query<StaffDetails[], number>({
      query: (branch_id: number) => `/staff-details/branch/${branch_id}`,
      providesTags: ['Staff'],
      transformResponse: (response: ApiResponse<StaffDetails[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // ➤ Get staff overview for dashboard
    getStaffOverview: builder.query<StaffOverview, GetStaffOverviewParams | void>({
      query: (params: GetStaffOverviewParams = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, params[key].toString());
          }
        });
        
        const queryString = queryParams.toString();
        return `/staff-details/dashboard/overview${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['StaffOverview'],
      transformResponse: (response: ApiResponse<StaffOverview>) => {
        return response.success ? response.data : {} as StaffOverview;
      }
    }),

    // ➤ Staff list with pagination and search
    getAllStaff: builder.query<ApiResponse<StaffDetails[]>, GetAllStaffParams>({
      query: ({ 
        page = 1, 
        limit = 10, 
        search = '',
        branch = '',
        job_title = '',
        employment_type = '',
        status = ''
      }: GetAllStaffParams = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });
        
        if (search) params.append('search', search);
        if (branch) params.append('branch', branch);
        if (job_title) params.append('job_title', job_title);
        if (employment_type) params.append('employment_type', employment_type);
        if (status) params.append('status', status);
        
        return `/staff-details/list?${params.toString()}`;
      },
      providesTags: ['Staff'],
    }),

    // Get all staff details (simple list)
    getAllStaffDetails: builder.query<StaffDetails[], void>({
      query: () => '/staff-details',
      providesTags: ['Staff'],
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response?.success && Array.isArray(response.data)) {
          return response.data;
        }
        return response?.data || response || [];
      }
    }),

    // Get staff by ID
    getStaffById: builder.query<StaffDetails, number>({
      query: (staff_id: number) => `/staff-details/${staff_id}`,
      providesTags: ['Staff'],
      transformResponse: (response: ApiResponse<StaffDetails>) => {
        return response.success ? response.data : {} as StaffDetails;
      }
    }),

    // Get staff by employee ID
    getStaffByEmployeeId: builder.query<StaffDetails, string>({
      query: (employee_id: string) => `/staff-details/employee/${employee_id}`,
      providesTags: ['Staff'],
      transformResponse: (response: ApiResponse<StaffDetails>) => {
        return response.success ? response.data : {} as StaffDetails;
      }
    }),

    // Get staff by department
    getStaffByDepartment: builder.query<StaffDetails[], string>({
      query: (department: string) => `/staff-details/department/${department}`,
      providesTags: ['Staff'],
      transformResponse: (response: ApiResponse<StaffDetails[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // Get staff by employment type
    getStaffByEmploymentType: builder.query<StaffDetails[], string>({
      query: (employment_type: string) => `/staff-details/employment-type/${employment_type}`,
      providesTags: ['Staff'],
      transformResponse: (response: ApiResponse<StaffDetails[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // Get terminated staff
    getTerminatedStaff: builder.query<StaffDetails[], void>({
      query: () => '/staff-details/status/terminated',
      providesTags: ['Staff'],
      transformResponse: (response: ApiResponse<StaffDetails[]>) => {
        return response.success ? response.data : [];
      }
    }),

    // ➤ Staff Profile
    getStaffProfile: builder.query<any, number>({
      query: (staff_id: number) => `/staff-details/profile/${staff_id}`,
      providesTags: ['Staff'],
      transformResponse: (response: ApiResponse<any>) => {
        return response.success ? response.data : {};
      }
    }),

    // ➤ Activity Logs
    getActivityLogs: builder.query<ApiResponse<any[]>, GetActivityLogsParams>({
      query: ({ 
        page = 1, 
        limit = 20,
        staff_id = '',
        action = '',
        start_date = '',
        end_date = '',
        search = ''
      }: GetActivityLogsParams = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });
        
        if (staff_id) params.append('staff_id', staff_id);
        if (action) params.append('action', action);
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);
        if (search) params.append('search', search);
        
        return `/staff-details/activity-logs?${params.toString()}`;
      },
      providesTags: ['ActivityLog'],
    }),

    // Get available filters
    getStaffFilters: builder.query<StaffFilters, void>({
      query: () => '/staff-details/filters',
      providesTags: ['Staff'],
      transformResponse: (response: ApiResponse<StaffFilters>) => {
        return response.success ? response.data : {
          branches: [],
          job_titles: [],
          departments: [],
          employment_types: []
        };
      }
    }),

    // =============================================
    // STAFF MUTATIONS (POST/PATCH/PUT/DELETE REQUESTS)
    // =============================================

    // ➤ Create New Staff
    createStaff: builder.mutation<any, any>({
      query: (staffData: any) => ({
        url: '/staff-details',
        method: 'POST',
        body: staffData,
      }),
      invalidatesTags: ['Staff', 'StaffOverview', 'StaffStats'],
    }),

    // ➤ Update Staff Details
    updateStaff: builder.mutation<any, { staff_id: number; [key: string]: any }>({
      query: ({ staff_id, ...updateData }) => ({
        url: `/staff-details/${staff_id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['Staff', 'StaffOverview'],
    }),

    // Update staff branch assignment
    updateStaffBranch: builder.mutation<any, { staff_id: number; branch_id: number }>({
      query: ({ staff_id, branch_id }) => ({
        url: `/staff-details/${staff_id}/branch`,
        method: 'PATCH',
        body: { branch_id },
      }),
      invalidatesTags: ['Staff'],
    }),

    // Update staff job details
    updateStaffJobDetails: builder.mutation<any, { 
      staff_id: number; 
      job_title: string; 
      department: string; 
      salary: number; 
      employment_type: string; 
    }>({
      query: ({ staff_id, job_title, department, salary, employment_type }) => ({
        url: `/staff-details/${staff_id}/job-details`,
        method: 'PATCH',
        body: { job_title, department, salary, employment_type },
      }),
      invalidatesTags: ['Staff'],
    }),

    // Update staff permissions
    updateStaffPermissions: builder.mutation<any, { staff_id: number; permissions: string }>({
      query: ({ staff_id, permissions }) => ({
        url: `/staff-details/${staff_id}/permissions`,
        method: 'PATCH',
        body: { permissions },
      }),
      invalidatesTags: ['Staff'],
    }),

    // Terminate staff
    terminateStaff: builder.mutation<any, { staff_id: number; termination_date: string }>({
      query: ({ staff_id, termination_date }) => ({
        url: `/staff-details/${staff_id}/terminate`,
        method: 'PATCH',
        body: { termination_date },
      }),
      invalidatesTags: ['Staff', 'StaffOverview'],
    }),

    // Reactivate staff
    reactivateStaff: builder.mutation<any, number>({
      query: (staff_id: number) => ({
        url: `/staff-details/${staff_id}/reactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Staff', 'StaffOverview'],
    }),

    // Update assigned vehicles
    updateAssignedVehicles: builder.mutation<any, { staff_id: number; assigned_vehicles: string }>({
      query: ({ staff_id, assigned_vehicles }) => ({
        url: `/staff-details/${staff_id}/assigned-vehicles`,
        method: 'PATCH',
        body: { assigned_vehicles },
      }),
      invalidatesTags: ['Staff'],
    }),

    // ➤ Staff Account Actions

    // Reset Password
    resetStaffPassword: builder.mutation<any, { staff_id: number; [key: string]: any }>({
      query: ({ staff_id, ...passwordData }) => ({
        url: `/staff-details/${staff_id}/reset-password`,
        method: 'POST',
        body: passwordData,
      }),
      invalidatesTags: ['Staff'],
    }),

    // Toggle Account Status
    toggleStaffStatus: builder.mutation<any, number>({
      query: (staff_id: number) => ({
        url: `/staff-details/${staff_id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Staff', 'StaffOverview'],
    }),

    // Impersonate Staff
    impersonateStaff: builder.mutation<any, { staff_id: number; reason: string }>({
      query: ({ staff_id, reason }) => ({
        url: `/staff-details/${staff_id}/impersonate`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Staff'],
    }),

    // Delete staff details
    deleteStaff: builder.mutation<any, number>({
      query: (staff_id: number) => ({
        url: `/staff-details/${staff_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff', 'StaffOverview', 'StaffStats'],
    }),
  }),
})

export const { 
  // Queries
  useGetActiveStaffQuery,
  useGetStaffByBranchQuery,
  useGetStaffOverviewQuery,
  useGetAllStaffQuery,
  useGetAllStaffDetailsQuery,
  useGetStaffByIdQuery,
  useGetStaffByEmployeeIdQuery,
  useGetStaffByDepartmentQuery,
  useGetStaffByEmploymentTypeQuery,
  useGetTerminatedStaffQuery,
  useGetStaffProfileQuery,
  useGetActivityLogsQuery,
  useGetStaffFiltersQuery,

  // Mutations
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useUpdateStaffBranchMutation,
  useUpdateStaffJobDetailsMutation,
  useUpdateStaffPermissionsMutation,
  useTerminateStaffMutation,
  useReactivateStaffMutation,
  useUpdateAssignedVehiclesMutation,
  useResetStaffPasswordMutation,
  useToggleStaffStatusMutation,
  useImpersonateStaffMutation,
  useDeleteStaffMutation,
} = staffApi;