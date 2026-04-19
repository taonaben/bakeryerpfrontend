/**
 * Purchase Order Detail Store
 * Zustand store with caching, devtools, and immer middleware
 * Manages state for purchase order detail page
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { purchaseOrderService } from '../services/purchase_orders_services';
import type { PurchaseOrderDetailState } from '../types/store';
import type { UpdatePurchaseOrderDTO } from '../types/purchase_orders_models';

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

export const usePurchaseOrderDetailStore = create<PurchaseOrderDetailState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      purchaseOrder: null,
      isLoading: false,
      isUpdating: false,
      isDeleting: false,
      isSubmitting: false,
      isApproving: false,
      isRejecting: false,
      isCancelling: false,
      error: null,
      updateError: null,
      cache: createCacheMeta(),

      // Fetch order with cache guard
      fetchOrder: async (id: string) => {
        const state = get();

        // Cache guard: skip if cache is fresh and data matches
        if (
          !isCacheStale(state.cache.lastFetched, state.cache.ttl) &&
          state.purchaseOrder?.id === id
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
          const order = await purchaseOrderService.fetchOrder(id);
          set((draft) => {
            draft.purchaseOrder = order;
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
            draft.error = error.message || 'Failed to fetch purchase order';
            draft.isLoading = false;
            draft.cache.isFetching = false;
          });
        }
      },

      // Update order
      updateOrder: async (id: string, data: UpdatePurchaseOrderDTO) => {
        set((draft) => {
          draft.isUpdating = true;
          draft.updateError = null;
        });

        try {
          const updated = await purchaseOrderService.updateOrder(id, data);
          set((draft) => {
            draft.purchaseOrder = updated;
            draft.isUpdating = false;
            draft.updateError = null;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.updateError = error.message || 'Failed to update purchase order';
            draft.isUpdating = false;
          });
          throw error;
        }
      },

      // Delete order
      deleteOrder: async (id: string) => {
        set((draft) => {
          draft.isDeleting = true;
          draft.error = null;
        });

        try {
          await purchaseOrderService.deleteOrder(id);
          set((draft) => {
            draft.isDeleting = false;
            draft.purchaseOrder = null;
            draft.cache.lastFetched = null;
            draft.error = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to delete purchase order';
            draft.isDeleting = false;
          });
          throw error;
        }
      },

      // Clear current order
      clearOrder: () => {
        set((draft) => {
          draft.purchaseOrder = null;
          draft.error = null;
          draft.updateError = null;
          draft.cache.lastFetched = null;
        });
      },

      // Submit order (Draft → Submitted)
      submitOrder: async (id: string) => {
        set((draft) => { draft.isSubmitting = true; draft.error = null; });
        try {
          const updated = await purchaseOrderService.submitOrder(id);
          set((draft) => {
            draft.purchaseOrder = updated;
            draft.isSubmitting = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to submit purchase order';
            draft.isSubmitting = false;
          });
          throw error;
        }
      },

      // Approve order (Submitted → Approved)
      approveOrder: async (id: string) => {
        set((draft) => { draft.isApproving = true; draft.error = null; });
        try {
          const updated = await purchaseOrderService.approveOrder(id);
          set((draft) => {
            draft.purchaseOrder = updated;
            draft.isApproving = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to approve purchase order';
            draft.isApproving = false;
          });
          throw error;
        }
      },

      // Reject order (Submitted → Rejected)
      rejectOrder: async (id: string, reason: string) => {
        set((draft) => { draft.isRejecting = true; draft.error = null; });
        try {
          const updated = await purchaseOrderService.rejectOrder(id, reason);
          set((draft) => {
            draft.purchaseOrder = updated;
            draft.isRejecting = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to reject purchase order';
            draft.isRejecting = false;
          });
          throw error;
        }
      },

      // Cancel order
      cancelOrder: async (id: string) => {
        set((draft) => { draft.isCancelling = true; draft.error = null; });
        try {
          const updated = await purchaseOrderService.cancelOrder(id);
          set((draft) => {
            draft.purchaseOrder = updated;
            draft.isCancelling = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to cancel purchase order';
            draft.isCancelling = false;
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
    { name: 'purchase-order-detail-store' },
  ),
);
