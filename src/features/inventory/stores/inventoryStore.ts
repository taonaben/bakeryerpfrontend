import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { inventoryService } from '../services/inventoryService';
import type { StockMovement, StockBalance, BatchRegistry, CreateMovementDTO } from '../types/models';
import type { InventoryStoreState } from '../types/store';

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const isCacheStale = (lastFetched: number | null): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_TTL_MS;
};

interface InventoryStore extends InventoryStoreState {
  // Actions
  setActiveTab: (tab: 'movements' | 'balances' | 'batches') => void;
  setSearchTerm: (term: string) => void;
  setWarehouse: (warehouseId: string) => void;
  
  // Data fetching with cache guards
  fetchMovements: (warehouseId: string, force?: boolean) => Promise<void>;
  fetchBalances: (warehouseId: string, force?: boolean) => Promise<void>;
  fetchBatches: (warehouseId: string, force?: boolean) => Promise<void>;
  
  // Mutations
  addMovement: (movement: CreateMovementDTO) => Promise<void>;
  
  // Cache invalidation
  invalidateMovements: () => void;
  invalidateBalances: () => void;
  invalidateBatches: () => void;
  invalidateAll: () => void;
}

export const useInventoryStore = create<InventoryStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      movements: [],
      balances: [],
      batches: [],
      activeTab: 'movements',
      searchTerm: '',
      selectedWarehouseId: null,
      movementsCache: { lastFetched: null, isStale: true, isFetching: false },
      balancesCache: { lastFetched: null, isStale: true, isFetching: false },
      batchesCache: { lastFetched: null, isStale: true, isFetching: false },
      loading: false,
      error: null,

      // UI Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      setWarehouse: (warehouseId) => {
        set({ selectedWarehouseId: warehouseId });
        // Invalidate all caches when warehouse changes
        get().invalidateAll();
      },

      // Data Fetching with Cache Guards
      fetchMovements: async (warehouseId, force = false) => {
        const state = get();
        
        // Cache guard: skip if fresh and not forced
        if (!force && 
            !isCacheStale(state.movementsCache.lastFetched) && 
            state.movements.length > 0) {
          console.log('[Cache Hit] Movements');
          return;
        }

        if (state.movementsCache.isFetching) {
          console.log('[Debounce] Already fetching movements');
          return;
        }

        set((draft) => {
          draft.movementsCache.isFetching = true;
          draft.loading = true;
          draft.error = null;
        });

        try {
          const movements = await inventoryService.fetchMovements(warehouseId);
          set((draft) => {
            draft.movements = movements;
            draft.movementsCache = {
              lastFetched: Date.now(),
              isStale: false,
              isFetching: false,
            };
            draft.loading = false;
          });
          console.log('[Cache Miss] Movements fetched:', movements.length);
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch movements';
            draft.movementsCache.isFetching = false;
            draft.loading = false;
          });
        }
      },

      fetchBalances: async (warehouseId, force = false) => {
        const state = get();
        
        if (!force && 
            !isCacheStale(state.balancesCache.lastFetched) && 
            state.balances.length > 0) {
          console.log('[Cache Hit] Balances');
          return;
        }

        if (state.balancesCache.isFetching) return;

        set((draft) => {
          draft.balancesCache.isFetching = true;
          draft.loading = true;
          draft.error = null;
        });

        try {
          const balances = await inventoryService.fetchBalances(warehouseId);
          set((draft) => {
            draft.balances = balances;
            draft.balancesCache = {
              lastFetched: Date.now(),
              isStale: false,
              isFetching: false,
            };
            draft.loading = false;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch balances';
            draft.balancesCache.isFetching = false;
            draft.loading = false;
          });
        }
      },

      fetchBatches: async (warehouseId, force = false) => {
        const state = get();
        
        if (!force && 
            !isCacheStale(state.batchesCache.lastFetched) && 
            state.batches.length > 0) {
          console.log('[Cache Hit] Batches');
          return;
        }

        if (state.batchesCache.isFetching) return;

        set((draft) => {
          draft.batchesCache.isFetching = true;
          draft.loading = true;
          draft.error = null;
        });

        try {
          const batches = await inventoryService.fetchBatches(warehouseId);
          set((draft) => {
            draft.batches = batches;
            draft.batchesCache = {
              lastFetched: Date.now(),
              isStale: false,
              isFetching: false,
            };
            draft.loading = false;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch batches';
            draft.batchesCache.isFetching = false;
            draft.loading = false;
          });
        }
      },

      // Mutations
      addMovement: async (movement) => {
        try {
          await inventoryService.createMovement(movement);
          // Invalidate movements and balances (they're now stale)
          get().invalidateMovements();
          get().invalidateBalances();
          // Force refetch
          await get().fetchMovements(movement.warehouse, true);
          await get().fetchBalances(movement.warehouse, true);
        } catch (error: any) {
          set({ error: error.message || 'Failed to add movement' });
          throw error;
        }
      },

      // Cache Invalidation
      invalidateMovements: () => set((draft) => {
        draft.movementsCache.isStale = true;
        draft.movementsCache.lastFetched = null;
      }),

      invalidateBalances: () => set((draft) => {
        draft.balancesCache.isStale = true;
        draft.balancesCache.lastFetched = null;
      }),

      invalidateBatches: () => set((draft) => {
        draft.batchesCache.isStale = true;
        draft.batchesCache.lastFetched = null;
      }),

      invalidateAll: () => {
        get().invalidateMovements();
        get().invalidateBalances();
        get().invalidateBatches();
      },
    }))
  )
);

// Selectors (for performance optimization)
export const selectFilteredMovements = (state: InventoryStore) => {
  const term = state.searchTerm.toLowerCase();
  if (!term) return state.movements;
  return state.movements.filter(m => 
    m.reference_number.toLowerCase().includes(term) ||
    m.batch.toLowerCase().includes(term) ||
    m.product_name.toLowerCase().includes(term)
  );
};

export const selectFilteredBalances = (state: InventoryStore) => {
  const term = state.searchTerm.toLowerCase();
  if (!term) return state.balances;
  return state.balances.filter(b => 
    b.product.toLowerCase().includes(term)
  );
};

export const selectFilteredBatches = (state: InventoryStore) => {
  const term = state.searchTerm.toLowerCase();
  if (!term) return state.batches;
  return state.batches.filter(b => 
    b.batch_number.toLowerCase().includes(term) ||
    b.product.toLowerCase().includes(term)
  );
};