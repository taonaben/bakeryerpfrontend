/**
 * Planned Order Detail Store
 * Zustand store with caching, devtools, and immer middleware
 * Manages state for planned order detail page
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { planningService } from '../services/planningServices';
import type { PlannedOrderDetailState } from '../types/store';
import type { UpdatePlannedOrderDTO, RequestPriorityOverrideDTO } from '../types/plannedOrderModel';

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

export const usePlannedOrderDetailStore = create<PlannedOrderDetailState>()(
  devtools(
    immer((set, get) => ({
      // ─── Initial State ────────────────────────
      order: null,
      isLoading: false,
      isUpdating: false,
      isRequesting: false,
      isApproving: false,
      isRejecting: false,
      isDeleting: false,
      error: null,
      updateError: null,
      overrideError: null,
      cache: createCacheMeta(),

      // ─── Fetch Order with Cache Guard ─────────
      fetchOrder: async (id: string) => {
        const state = get();

        // Cache guard: skip if cache is fresh and data matches
        if (
          !isCacheStale(state.cache.lastFetched, state.cache.ttl) &&
          state.order?.id === id
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
          const order = await planningService.fetchPlannedOrder(id);
          set((draft) => {
            draft.order = order;
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
            draft.error = error.message || 'Failed to fetch planned order';
            draft.isLoading = false;
            draft.cache.isFetching = false;
          });
        }
      },

      // ─── Update Order ─────────────────────────
      updateOrder: async (id: string, data: UpdatePlannedOrderDTO) => {
        set((draft) => {
          draft.isUpdating = true;
          draft.updateError = null;
        });

        try {
          const updated = await planningService.updatePlannedOrder(id, data);
          set((draft) => {
            draft.order = updated;
            draft.isUpdating = false;
            draft.updateError = null;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.updateError = error.message || 'Failed to update planned order';
            draft.isUpdating = false;
          });
          throw error;
        }
      },

      // ─── Delete Order ─────────────────────────
      deleteOrder: async (id: string) => {
        set((draft) => {
          draft.isDeleting = true;
          draft.error = null;
        });

        try {
          await planningService.deletePlannedOrder(id);
          set((draft) => {
            draft.isDeleting = false;
            draft.order = null;
            draft.cache.lastFetched = null;
            draft.error = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to delete planned order';
            draft.isDeleting = false;
          });
          throw error;
        }
      },

      // ─── Priority Override – Request ──────────
      requestPriorityOverride: async (id: string, data: RequestPriorityOverrideDTO) => {
        set((draft) => {
          draft.isRequesting = true;
          draft.overrideError = null;
        });

        try {
          const updated = await planningService.requestPriorityOverride(id, data);
          set((draft) => {
            draft.order = updated;
            draft.isRequesting = false;
            draft.overrideError = null;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.overrideError = error.message || 'Failed to request priority override';
            draft.isRequesting = false;
          });
          throw error;
        }
      },

      // ─── Priority Override – Approve ──────────
      approvePriorityOverride: async (id: string, approvedBy: string) => {
        set((draft) => {
          draft.isApproving = true;
          draft.overrideError = null;
        });

        try {
          const updated = await planningService.approvePriorityOverride(id, approvedBy);
          set((draft) => {
            draft.order = updated;
            draft.isApproving = false;
            draft.overrideError = null;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.overrideError = error.message || 'Failed to approve priority override';
            draft.isApproving = false;
          });
          throw error;
        }
      },

      // ─── Priority Override – Reject ───────────
      rejectPriorityOverride: async (id: string, reason: string) => {
        set((draft) => {
          draft.isRejecting = true;
          draft.overrideError = null;
        });

        try {
          const updated = await planningService.rejectPriorityOverride(id, 'system', reason);
          set((draft) => {
            draft.order = updated;
            draft.isRejecting = false;
            draft.overrideError = null;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.overrideError = error.message || 'Failed to reject priority override';
            draft.isRejecting = false;
          });
          throw error;
        }
      },

      // ─── Clear & Invalidate ───────────────────
      clearOrder: () => {
        set((draft) => {
          draft.order = null;
          draft.error = null;
          draft.updateError = null;
          draft.overrideError = null;
          draft.cache.lastFetched = null;
        });
      },

      invalidateCache: () => {
        set((draft) => {
          draft.cache.lastFetched = null;
        });
      },
    })),
    { name: 'planned-order-detail-store' },
  ),
);
