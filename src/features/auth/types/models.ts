export type UserRole = 
  | 'warehouse_staff'
  | 'production_operator'
  | 'production_supervisor'
  | 'inventory_controller'
  | 'planner'
  | 'sales_rep'
  | 'purchasing_officer'
  | 'accountant'
  | 'quality_officer'
  | 'manager'
  | 'owner_director'
  | 'system_admin';

export interface User {
    id: string;
    emp_code: string;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    company: string;
    company_name?: string;
    role: UserRole;
    is_active: boolean;
    is_staff: boolean;
    date_joined: string;
}

// Auth Request/Response Types
export interface LoginRequest {
    emp_code: string;
    password: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface TokenRefreshResponse {
    access: string;
}