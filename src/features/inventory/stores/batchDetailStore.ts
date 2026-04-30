/**
 * Batch Detail Store
 * Zustand store with caching, devtools, and immer middleware
 * Manages state for batch detail page
 * 
 * Pattern: follows productStore.ts structure
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import batchDetailService from '../services/batchDetailService';
import { BatchDetailState } from '../types/batchDetail';

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const isCacheStale = (lastFetched: number | null, ttl: number): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > ttl;
};

const createCacheMeta = (ttl: number = CACHE_TTL_MS) => ({
  lastFetched: null,
  ttl,
  isFetching: false,
});

interface BatchDetailStore extends BatchDetailState {
  // Additional actions
  setMovementPage: (page: number) => void;
}

export const useBatchDetailStore = create<BatchDetailStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      batch: null,
      movements: [],
      isLoading: false,
      isUpdating: false,
      isDeletingbatch: false,
      error: null,
      updateError: null,
      cache: createCacheMeta(),
      movementsPagination: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      },

      // Fetch batch with cache guard
      fetchBatch: async (batchId: string) => {
        const state = get();

        // Cache guard: skip if cache is fresh and data exists
        if (
          !isCacheStale(state.cache.lastFetched, state.cache.ttl) &&
          state.batch?.id === batchId
        ) {
          return;
        }

        // Prevent duplicate fetches in-flight
        if (state.cache.isFetching) {
          return;
        }

        set((draft) => {
          draft.cache.isFetching = true;
          draft.isLoading = true;
          draft.error = null;
        });

        try {
          const batch = await batchDetailService.fetchBatchDetail(batchId);
          set((draft) => {
            draft.batch = batch;
            draft.cache = {
              lastFetched: Date.now(),
              ttl: CACHE_TTL_MS,
              isFetching: false,
            };
            draft.isLoading = false;
            draft.error = null;
          });

          // Also fetch movements for this batch
          try {
            const { movements, totalPages } = await batchDetailService.fetchMovementsForBatch(
              batchId,
              1
            );
            set((draft) => {
              draft.movements = movements;
              draft.movementsPagination.totalPages = totalPages;
              draft.movementsPagination.currentPage = 1;
            });
          } catch (movementError: any) {
            // Don't fail the whole page if movements error; just log and continue
            console.warn('Failed to fetch movements:', movementError.message);
          }
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch batch';
            draft.isLoading = false;
            draft.cache.isFetching = false;
          });
        }
      },

      // Update batch
      updateBatch: async (batchId: string, data) => {
        set((draft) => {
          draft.isUpdating = true;
          draft.updateError = null;
        });

        try {
          const updated = await batchDetailService.updateBatch(batchId, data);
          set((draft) => {
            draft.batch = updated;
            draft.isUpdating = false;
            draft.updateError = null;
            // Invalidate cache so next view refreshes
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.updateError = error.message || 'Failed to update batch';
            draft.isUpdating = false;
          });
          throw error; // Re-throw for caller to handle UI notification
        }
      },

      // Delete batch
      deleteBatch: async (batchId: string) => {
        set((draft) => {
          draft.isDeletingbatch = true;
          draft.error = null;
        });

        try {
          await batchDetailService.deleteBatch(batchId);
          set((draft) => {
            draft.isDeletingbatch = false;
            draft.batch = null;
            draft.movements = [];
            draft.cache.lastFetched = null;
            draft.error = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to delete batch';
            draft.isDeletingbatch = false;
          });
          throw error;
        }
      },

      // Fetch movements with pagination
      fetchMovements: async (batchId: string, page: number = 1) => {
        try {
          const { movements, totalPages } = await batchDetailService.fetchMovementsForBatch(
            batchId,
            page
          );
          set((draft) => {
            draft.movements = movements;
            draft.movementsPagination.totalPages = totalPages;
            draft.movementsPagination.currentPage = page;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch movements';
          });
          throw error;
        }
      },

      // Set movement pagination
      setMovementPage: (page: number) => {
        const state = get();
        if (state.batch) {
          get().fetchMovements(state.batch.id, page);
        }
      },

      // Clear current batch
      clearBatch: () => {
        set((draft) => {
          draft.batch = null;
          draft.movements = [];
          draft.error = null;
          draft.updateError = null;
          draft.cache.lastFetched = null;
          draft.movementsPagination = {
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
          };
        });
      },

      // Set error
      setError: (error: string | null) => {
        set((draft) => {
          draft.error = error;
        });
      },
    })),
    { name: 'batch-detail-store' }
  )
);

export default useBatchDetailStore;
