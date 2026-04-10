import { inventoryApi } from '../api/client';
import type { StockMovement, StockBalance, BatchRegistry, CreateMovementDTO } from '../types/models';
import type { BatchFilters } from '../hooks/useBatchFilters';

// Service layer: transforms and validates data
export const inventoryService = {
  // Movements
  async fetchMovements(warehouseId: string, searchTerm?: string, page: number = 1): Promise<{ data: StockMovement[]; count: number; currentPage: number; totalPages: number }> {
    if (!warehouseId) throw new Error('Warehouse ID is required');
    const response = await inventoryApi.getMovements(warehouseId, searchTerm, page);
    const pageSize = response.results.length > 0 ? 10 : response.results.length; // Assuming 10 items per page
    const totalPages = Math.ceil(response.count / (pageSize || 10));
    
    return {
      data: response.results.map(m => this.normalizeMovement(m)),
      count: response.count,
      currentPage: page,
      totalPages
    };
  },

  async createMovement(movement: CreateMovementDTO): Promise<StockMovement> {
    this.validateMovement(movement);
    const created = await inventoryApi.createMovement(movement);
    return this.normalizeMovement(created);
  },

  // Balances
  async fetchBalances(warehouseId: string, searchTerm?: string, page: number = 1): Promise<{ data: StockBalance[]; count: number; currentPage: number; totalPages: number }> {
    if (!warehouseId) throw new Error('Warehouse ID is required');
    const response = await inventoryApi.getBalances(warehouseId, searchTerm, page);
    const pageSize = response.results.length > 0 ? 10 : response.results.length; // Assuming 10 items per page
    const totalPages = Math.ceil(response.count / (pageSize || 10));
    
    return {
      data: response.results.map(b => this.normalizeBalance(b)),
      count: response.count,
      currentPage: page,
      totalPages
    };
  },

  // Batches - with advanced filtering
  async fetchBatches(warehouseId: string, filterParams?: Partial<BatchFilters> | string, page?: number): Promise<{ data: BatchRegistry[]; count: number; currentPage: number; totalPages: number }> {
    if (!warehouseId) throw new Error('Warehouse ID is required');
    
    // Support both old API (searchTerm, page) and new API (filterParams)
    let apiParams: Record<string, any> = { warehouse_id: warehouseId };
    
    if (typeof filterParams === 'string') {
      // Legacy: searchTerm as string
      if (filterParams) apiParams.search = filterParams;
      if (page) apiParams.page = page;
    } else if (filterParams && typeof filterParams === 'object') {
      // New: full filter object
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          apiParams[key] = value;
        }
      });
    }
    
    const response = await inventoryApi.getBatches(apiParams);
    const pageSize = apiParams.page_size || 25;
    const totalPages = Math.ceil(response.count / pageSize);
    
    return {
      data: response.results.map(b => this.normalizeBatch(b)),
      count: response.count,
      currentPage: apiParams.page || 1,
      totalPages
    };
  },

  async createBatch(batch: Omit<BatchRegistry, 'id'>): Promise<BatchRegistry> {
    this.validateBatch(batch);
    const created = await inventoryApi.createBatch(batch);
    return this.normalizeBatch(created);
  },

  // Data normalization
  normalizeMovement(raw: any): StockMovement {
    return {
      ...raw,
      reference_number: raw.reference_number || raw.reference || raw.referenceNumber || raw.ref_number || raw.ref || '',
      quantity: parseFloat(raw.quantity),
      movement_type: (raw.movement_type?.toUpperCase() || 'IN') as 'IN' | 'OUT' | 'ADJUSTMENT',
      created_at: raw.created_at || new Date().toISOString(),
      total_quantity: parseFloat(raw.total_quantity || raw.quantity || 0),
      batches_detail: Array.isArray(raw.batches_detail) ? raw.batches_detail : [],
    };
  },

  normalizeBalance(raw: any): StockBalance {
    return {
      ...raw,
      quantity_on_hand: parseFloat(raw.quantity_on_hand),
      status: (raw.status?.toUpperCase() || 'GOOD') as 'EMPTY' | 'ALMOST_OUT' | 'GOOD' | 'FULL',
    };
  },

  normalizeBatch(raw: any): BatchRegistry {
    return {
      ...raw,
      quantity: parseFloat(raw.quantity),
      status: (raw.status?.toUpperCase() || 'ACTIVE') as 'ACTIVE' | 'EXPIRED' | 'DEPLETED',
    };
  },

  // Validation helpers
  validateMovement(movement: CreateMovementDTO): void {
    if (!movement.warehouse) throw new Error('Warehouse is required');
    if (!movement.movement_type) throw new Error('Movement type is required');
    if (movement.quantity === undefined || movement.quantity === null) throw new Error('Quantity is required');
  },

  validateBatch(batch: Omit<BatchRegistry, 'id'>): void {
    if (!batch.batch_number) throw new Error('Batch number is required');
    if (!batch.product) throw new Error('Product is required');
    if (!batch.warehouse) throw new Error('Warehouse is required');
    if (batch.quantity === undefined || batch.quantity === null) throw new Error('Quantity is required');
  },
};