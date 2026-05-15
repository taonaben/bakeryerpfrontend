import { profileApi } from "../api/profile_api";
import type {
  CreateProfileUserPayload,
  PatchProfileUserPayload,
  ProfileUser,
  UpdateProfileUserPayload,
} from "../types/profile_model";

export const profileService = {
  async fetchUsers(params: Record<string, unknown> = {}) {
    const response = await profileApi.getUsers(params);
    const pageSize = Number(params.page_size || 25);
    const currentPage = Number(params.page || 1);
    const totalPages = Math.max(1, Math.ceil(response.count / pageSize));

    return {
      data: response.results,
      count: response.count,
      currentPage,
      totalPages,
      next: response.next,
      previous: response.previous,
    };
  },

  async getUserById(id: string): Promise<ProfileUser> {
    return profileApi.getUserById(id);
  },

  async getCurrentUser(): Promise<ProfileUser> {
    return profileApi.getCurrentUser();
  },

  async createUser(payload: CreateProfileUserPayload): Promise<ProfileUser> {
    return profileApi.createUser(payload);
  },

  async updateUser(
    id: string,
    payload: UpdateProfileUserPayload,
  ): Promise<ProfileUser> {
    return profileApi.updateUser(id, payload);
  },

  async patchUser(
    id: string,
    payload: PatchProfileUserPayload,
  ): Promise<ProfileUser> {
    return profileApi.patchUser(id, payload);
  },

  async deleteUser(id: string): Promise<void> {
    return profileApi.deleteUser(id);
  },
};
