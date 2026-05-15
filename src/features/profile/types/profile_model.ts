import type { User } from "../../auth/types/models";

export type ProfileUser = User;

export interface PaginatedProfileUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProfileUser[];
}

export type CreateProfileUserPayload = Record<string, unknown>;

export type UpdateProfileUserPayload = Record<string, unknown>;

export type PatchProfileUserPayload = Partial<UpdateProfileUserPayload>;
