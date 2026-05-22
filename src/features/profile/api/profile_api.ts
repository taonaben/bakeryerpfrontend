import apiClient from "@/shared/services/api";
import type {
  ChangePasswordPayload,
  CreatedProfileUser,
  CreateProfileUserPayload,
  PaginatedProfileUsersResponse,
  PasswordMutationResponse,
  PatchProfileUserPayload,
  ProfileUser,
  ProfileUsersQueryParams,
  RegisterProfileUserPayload,
  RegisterProfileUserResponse,
  ResetPasswordPayload,
  UpdateProfileUserPayload,
} from "../types/profile_model";

const PROFILE_USERS_ENDPOINT = "/account/users";

const toPaginatedUsers = (data: unknown): PaginatedProfileUsersResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data as ProfileUser[],
    };
  }

  return data as PaginatedProfileUsersResponse;
};

export const profileApi = {
  async getUsers(
    params: ProfileUsersQueryParams = {},
  ): Promise<PaginatedProfileUsersResponse> {
    const { data } = await apiClient.get(PROFILE_USERS_ENDPOINT, { params });
    return toPaginatedUsers(data);
  },

  async createUser(
    payload: CreateProfileUserPayload,
  ): Promise<CreatedProfileUser> {
    const { data } = await apiClient.post(PROFILE_USERS_ENDPOINT, payload);
    return data;
  },

  async registerUser(
    payload: RegisterProfileUserPayload,
  ): Promise<RegisterProfileUserResponse> {
    const { data } = await apiClient.post(
      `${PROFILE_USERS_ENDPOINT}/register`,
      payload,
    );
    return data;
  },

  async getUserById(id: string): Promise<ProfileUser> {
    const { data } = await apiClient.get(`${PROFILE_USERS_ENDPOINT}/${id}`);
    return data;
  },

  async updateUser(
    id: string,
    payload: UpdateProfileUserPayload,
  ): Promise<ProfileUser> {
    const { data } = await apiClient.put(
      `${PROFILE_USERS_ENDPOINT}/${id}`,
      payload,
    );
    return data;
  },

  async patchUser(
    id: string,
    payload: PatchProfileUserPayload,
  ): Promise<ProfileUser> {
    const { data } = await apiClient.patch(
      `${PROFILE_USERS_ENDPOINT}/${id}`,
      payload,
    );
    return data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`${PROFILE_USERS_ENDPOINT}/${id}`);
  },

  async getCurrentUser(): Promise<ProfileUser> {
    const { data } = await apiClient.get(`${PROFILE_USERS_ENDPOINT}/me`);
    return data;
  },

  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<PasswordMutationResponse> {
    const { data } = await apiClient.post(
      `${PROFILE_USERS_ENDPOINT}/change-password`,
      payload,
    );
    return data;
  },

  async resetPassword(
    id: string,
    payload: ResetPasswordPayload,
  ): Promise<PasswordMutationResponse> {
    const { data } = await apiClient.post(
      `${PROFILE_USERS_ENDPOINT}/${id}/reset-password`,
      payload,
    );
    return data;
  },
};
