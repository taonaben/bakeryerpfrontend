import { profileApi } from "../api/profile_api";
import type {
  ChangePasswordPayload,
  CreatedProfileUser,
  CreateProfileUserPayload,
  PasswordMutationResponse,
  PatchProfileUserPayload,
  ProfileUser,
  ProfileUsersQueryParams,
  RegisterProfileUserPayload,
  RegisterProfileUserResponse,
  ResetPasswordPayload,
  UpdateProfileUserPayload,
} from "../types/profile_model";

export const profileService = {
  async fetchUsers(params: ProfileUsersQueryParams = {}) {
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

  async listUsers(params: ProfileUsersQueryParams = {}) {
    return profileApi.getUsers(params);
  },

  async getUserById(id: string): Promise<ProfileUser> {
    return profileApi.getUserById(id);
  },

  async getCurrentUser(): Promise<ProfileUser> {
    return profileApi.getCurrentUser();
  },

  async createUser(
    payload: CreateProfileUserPayload,
  ): Promise<CreatedProfileUser> {
    return profileApi.createUser(payload);
  },

  async registerUser(
    payload: RegisterProfileUserPayload,
  ): Promise<RegisterProfileUserResponse> {
    return profileApi.registerUser(payload);
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

  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<PasswordMutationResponse> {
    return profileApi.changePassword(payload);
  },

  async resetPassword(
    id: string,
    payload: ResetPasswordPayload,
  ): Promise<PasswordMutationResponse> {
    return profileApi.resetPassword(id, payload);
  },
};
