import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { reorderPolicyService } from '../services/reorderPolicyServices';
import type {
  CreateReorderPolicyDTO,
  ReorderPolicy,
  UpdateReorderPolicyDTO,
} from '../types/reorderPolicyModel';

interface ReorderPolicyState {
  policies: ReorderPolicy[];
  activePolicy: ReorderPolicy | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  fetchPoliciesByProduct: (productId: string) => Promise<void>;
  createPolicy: (payload: CreateReorderPolicyDTO) => Promise<void>;
  updatePolicy: (id: string, payload: UpdateReorderPolicyDTO) => Promise<void>;
  deletePolicy: (id: string) => Promise<void>;
  clearPolicies: () => void;
}

export const useReorderPolicyStore = create<ReorderPolicyState>()(
  devtools(
    immer((set, get) => ({
      policies: [],
      activePolicy: null,
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      error: null,

      fetchPoliciesByProduct: async (productId) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const result = await reorderPolicyService.fetchReorderPolicies({
            product: productId,
            page: 1,
            page_size: 25,
          });
          const matchingPolicies = result.data.filter((item) => item.product === productId);

          set((state) => {
            state.policies = matchingPolicies;
            state.activePolicy =
              matchingPolicies.find((item) => item.is_active) ||
              matchingPolicies[0] ||
              null;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Failed to fetch reorder policies';
            state.isLoading = false;
          });
        }
      },

      createPolicy: async (payload) => {
        set((state) => {
          state.isSaving = true;
          state.error = null;
        });

        try {
          const created = await reorderPolicyService.createReorderPolicy(payload);
          set((state) => {
            state.policies = [created, ...state.policies];
            state.activePolicy = created;
            state.isSaving = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Failed to create reorder policy';
            state.isSaving = false;
          });
          throw error;
        }
      },

      updatePolicy: async (id, payload) => {
        set((state) => {
          state.isSaving = true;
          state.error = null;
        });

        try {
          const updated = await reorderPolicyService.updateReorderPolicy(id, payload);
          set((state) => {
            state.policies = state.policies.map((item) =>
              item.id === id ? updated : item,
            );
            state.activePolicy = updated;
            state.isSaving = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Failed to update reorder policy';
            state.isSaving = false;
          });
          throw error;
        }
      },

      deletePolicy: async (id) => {
        set((state) => {
          state.isDeleting = true;
          state.error = null;
        });

        try {
          await reorderPolicyService.deleteReorderPolicy(id);
          set((state) => {
            state.policies = state.policies.filter((item) => item.id !== id);
            state.activePolicy =
              state.policies.find((item) => item.id !== id && item.is_active) ||
              state.policies.find((item) => item.id !== id) ||
              null;
            state.isDeleting = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Failed to delete reorder policy';
            state.isDeleting = false;
          });
          throw error;
        }
      },

      clearPolicies: () => {
        set((state) => {
          state.policies = [];
          state.activePolicy = null;
          state.error = null;
        });
      },
    })),
    { name: 'reorder-policy-store' },
  ),
);

export default useReorderPolicyStore;
