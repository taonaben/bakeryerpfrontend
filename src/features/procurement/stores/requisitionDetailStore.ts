/**
 * Requisition Detail Store
 * Zustand store with caching, devtools, and immer middleware
 * Manages state for requisition detail page
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { requisitionService } from '../services/procurement_services';
import type { RequisitionDetailState } from '../types/store';
import type { UpdateRequisitionDTO } from '../types/models';

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const isCacheStale = (lastFetched: number | null, ttl: number): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > ttl;
};

const createCacheMeta = (ttl: number = CACHE_TTL_MS) => ({
  lastFetched: null as number | null,
  ttl,
  isFetching: false,
});

export const useRequisitionDetailStore = create<RequisitionDetailState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      requisition: null,
      isLoading: false,
      isUpdating: false,
      isDeleting: false,
      isSubmitting: false,
      isApproving: false,
      isRejecting: false,
      error: null,
      updateError: null,
      cache: createCacheMeta(),

      // Fetch requisition with cache guard
      fetchRequisition: async (id: string) => {
        const state = get();

        // Cache guard: skip if cache is fresh and data matches
        if (
          !isCacheStale(state.cache.lastFetched, state.cache.ttl) &&
          state.requisition?.id === id
        ) {
          return;
        }

        // Prevent duplicate in-flight fetches
        if (state.cache.isFetching) return;

        set((draft) => {
          draft.cache.isFetching = true;
          draft.isLoading = true;
          draft.error = null;
        });

        try {
          const requisition = await requisitionService.fetchRequisition(id);
          set((draft) => {
            draft.requisition = requisition;
            draft.cache = {
              lastFetched: Date.now(),
              ttl: CACHE_TTL_MS,
              isFetching: false,
            };
            draft.isLoading = false;
            draft.error = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch requisition';
            draft.isLoading = false;
            draft.cache.isFetching = false;
          });
        }
      },

      // Update requisition
      updateRequisition: async (id: string, data: UpdateRequisitionDTO) => {
        set((draft) => {
          draft.isUpdating = true;
          draft.updateError = null;
        });

        try {
          const updated = await requisitionService.updateRequisition(id, data);
          set((draft) => {
            draft.requisition = updated;
            draft.isUpdating = false;
            draft.updateError = null;
            // Invalidate cache so next navigation refreshes
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.updateError = error.message || 'Failed to update requisition';
            draft.isUpdating = false;
          });
          throw error; // Re-throw for caller to handle UI notification
        }
      },

      // Delete requisition
      deleteRequisition: async (id: string) => {
        set((draft) => {
          draft.isDeleting = true;
          draft.error = null;
        });

        try {
          await requisitionService.deleteRequisition(id);
          set((draft) => {
            draft.isDeleting = false;
            draft.requisition = null;
            draft.cache.lastFetched = null;
            draft.error = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to delete requisition';
            draft.isDeleting = false;
          });
          throw error;
        }
      },

      // Clear current requisition
      clearRequisition: () => {
        set((draft) => {
          draft.requisition = null;
          draft.error = null;
          draft.updateError = null;
          draft.cache.lastFetched = null;
        });
      },

      // Submit requisition (Draft → Submitted)
      submitRequisition: async (id: string) => {
        set((draft) => { draft.isSubmitting = true; draft.error = null; });
        try {
          const updated = await requisitionService.submitRequisition(id);
          set((draft) => {
            draft.requisition = updated;
            draft.isSubmitting = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to submit requisition';
            draft.isSubmitting = false;
          });
          throw error;
        }
      },

      // Approve requisition (Submitted → Approved)
      approveRequisition: async (id: string) => {
        set((draft) => { draft.isApproving = true; draft.error = null; });
        try {
          const updated = await requisitionService.approveRequisition(id);
          set((draft) => {
            draft.requisition = updated;
            draft.isApproving = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to approve requisition';
            draft.isApproving = false;
          });
          throw error;
        }
      },

      // Reject requisition (Submitted → Rejected)
      rejectRequisition: async (id: string, reason: string) => {
        set((draft) => { draft.isRejecting = true; draft.error = null; });
        try {
          const updated = await requisitionService.rejectRequisition(id, reason);
          set((draft) => {
            draft.requisition = updated;
            draft.isRejecting = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to reject requisition';
            draft.isRejecting = false;
          });
          throw error;
        }
      },

      // Set error
      setError: (error: string | null) => {
        set((draft) => {
          draft.error = error;
        });
      },
    })),
    { name: 'requisition-detail-store' },
  ),
);

export default useRequisitionDetailStore;
