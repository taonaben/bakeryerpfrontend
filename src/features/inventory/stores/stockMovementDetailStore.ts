/**
 * Stock Movement Detail Store
 * Zustand store with caching, devtools, and immer middleware
 * Manages state for stock movement detail page
 * 
 * Pattern: follows batchDetailStore.ts structure
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import stockMovementDetailService from '../services/stockMovementDetailService';
import { StockMovementDetailState } from '../types/stockMovementDetail';

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

export const useStockMovementDetailStore = create<StockMovementDetailState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      movement: null,
      movementsList: [],
      isLoading: false,
      isDeletingMovement: false,
      isLoadingList: false,
      error: null,
      deleteError: null,
      cache: createCacheMeta(),
      movementsListPagination: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 50,
      },

      // Fetch stock movement with cache guard
      fetchMovement: async (movementId: string) => {
        const state = get();

        // Cache guard: skip if cache is fresh and data exists
        if (
          !isCacheStale(state.cache.lastFetched, state.cache.ttl) &&
          state.movement?.id === movementId
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
          const movement = await stockMovementDetailService.fetchStockMovementDetail(movementId);
          set((draft) => {
            draft.movement = movement;
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
            draft.error = error.message || 'Failed to fetch stock movement';
            draft.isLoading = false;
            draft.cache.isFetching = false;
          });
        }
      },

      // Delete stock movement
      deleteMovement: async (movementId: string) => {
        set((draft) => {
          draft.isDeletingMovement = true;
          draft.deleteError = null;
        });

        try {
          await stockMovementDetailService.deleteStockMovement(movementId);
          set((draft) => {
            draft.isDeletingMovement = false;
            draft.movement = null;
            draft.movementsList = [];
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.deleteError = error.message || 'Failed to delete stock movement';
            draft.isDeletingMovement = false;
          });
          throw error; // Re-throw for caller to handle UI notification
        }
      },

      // Fetch stock movements list (for breadcrumb dropdown)
      fetchMovementsList: async (page: number = 1, pageSize: number = 50) => {
        set((draft) => {
          draft.isLoadingList = true;
          draft.error = null;
        });

        try {
          const { movements, totalPages } = await stockMovementDetailService.fetchStockMovementsList(
            page,
            pageSize
          );
          set((draft) => {
            draft.movementsList = movements;
            draft.movementsListPagination = {
              currentPage: page,
              totalPages,
              pageSize,
            };
            draft.isLoadingList = false;
            draft.error = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch stock movements list';
            draft.isLoadingList = false;
          });
        }
      },

      // Clear movement data
      clearMovement: () => {
        set((draft) => {
          draft.movement = null;
          draft.error = null;
          draft.deleteError = null;
          draft.cache.lastFetched = null;
        });
      },

      // Set error manually
      setError: (error: string | null) => {
        set((draft) => {
          draft.error = error;
        });
      },
    }))
  )
);

export default useStockMovementDetailStore;
