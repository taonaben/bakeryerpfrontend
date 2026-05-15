import apiClient from "@/shared/services/api";
import type {
  CreateProfileUserPayload,
  PaginatedProfileUsersResponse,
  PatchProfileUserPayload,
  ProfileUser,
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
    params: Record<string, unknown> = {},
  ): Promise<PaginatedProfileUsersResponse> {
    const { data } = await apiClient.get(PROFILE_USERS_ENDPOINT, { params });
    return toPaginatedUsers(data);
  },

  async createUser(payload: CreateProfileUserPayload): Promise<ProfileUser> {
    const { data } = await apiClient.post(PROFILE_USERS_ENDPOINT, payload);
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
};
