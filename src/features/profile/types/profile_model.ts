import type { LoginResponse, User, UserRole } from "../../auth/types/models";

export type ProfileUser = User;

export interface ProfileUsersQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface PaginatedProfileUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProfileUser[];
}

export interface CreateProfileUserPayload {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  company: string;
  role: UserRole;
}

export interface CreatedProfileUser {
  emp_code: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  role: UserRole;
}

export type RegisterProfileUserPayload = CreateProfileUserPayload;

export type RegisterProfileUserResponse = LoginResponse;

export interface UpdateProfileUserPayload {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
  is_staff?: boolean;
}

export type PatchProfileUserPayload = Partial<UpdateProfileUserPayload>;

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  new_password2: string;
}

export interface ResetPasswordPayload {
  new_password: string;
  new_password2: string;
}

export interface PasswordMutationResponse {
  detail: string;
  user_id: string;
}
