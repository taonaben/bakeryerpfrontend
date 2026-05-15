import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { profileService } from "../services/profile_services";
import type { ProfileUser } from "../types/profile_model";

interface ProfileState {
  profile: ProfileUser | null;
  requestedUserId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentProfile: () => Promise<void>;
  fetchProfileById: (id: string) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    immer((set) => ({
      profile: null,
      requestedUserId: null,
      isLoading: false,
      error: null,

      fetchCurrentProfile: async () => {
        set((state) => {
          state.profile = null;
          state.requestedUserId = null;
          state.isLoading = true;
          state.error = null;
        });

        try {
          const profile = await profileService.getCurrentUser();
          set((state) => {
            state.profile = profile;
            state.requestedUserId = profile.id;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.profile = null;
            state.error = error?.message || "Failed to load profile";
            state.isLoading = false;
          });
        }
      },

      fetchProfileById: async (id) => {
        set((state) => {
          state.profile = null;
          state.requestedUserId = id;
          state.isLoading = true;
          state.error = null;
        });

        try {
          const profile = await profileService.getUserById(id);
          set((state) => {
            state.profile = profile;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.profile = null;
            state.error = error?.message || "Failed to load profile";
            state.isLoading = false;
          });
        }
      },

      clearProfile: () => {
        set((state) => {
          state.profile = null;
          state.requestedUserId = null;
          state.error = null;
          state.isLoading = false;
        });
      },
    })),
    { name: "profile-store" },
  ),
);

export default useProfileStore;
