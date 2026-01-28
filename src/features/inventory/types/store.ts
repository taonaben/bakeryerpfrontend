export interface CacheMetadata {
  lastFetched: number | null;
  isStale: boolean;
  isFetching: boolean;
}

export interface InventoryStoreState {
  // Data
  movements: StockMovement[];
  balances: StockBalance[];
  batches: BatchRegistry[];
  
  // UI State
  activeTab: 'movements' | 'balances' | 'batches';
  searchTerm: string;
  selectedWarehouseId: string | null;
  
  // Cache metadata
  movementsCache: CacheMetadata;
  balancesCache: CacheMetadata;
  batchesCache: CacheMetadata;
  
  // Loading & Error
  loading: boolean;
  error: string | null;
  
  // Actions (declared separately below)
}