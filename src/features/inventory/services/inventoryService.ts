import { inventoryApi } from '../api/client';
import type { StockMovement, StockBalance, BatchRegistry, CreateMovementDTO } from '../types/models';

// Service layer: transforms, validates, aggregates - NO STATE
export const inventoryService = {
  // Movements
  async fetchMovements(warehouseId: string): Promise<StockMovement[]> {
    const response = await inventoryApi.getMovements(warehouseId);
    return response.results.map(this.normalizeMovement);
  },

  async createMovement(movement: CreateMovementDTO): Promise<StockMovement> {
    const created = await inventoryApi.createMovement(movement);
    return this.normalizeMovement(created);
  },

  // Balances
  async fetchBalances(warehouseId: string): Promise<StockBalance[]> {
    const response = await inventoryApi.getBalances(warehouseId);
    return response.results.map(this.normalizeBalance);
  },

  // Batches
  async fetchBatches(warehouseId: string): Promise<BatchRegistry[]> {
    const response = await inventoryApi.getBatches(warehouseId);
    return response.results.map(this.normalizeBatch);
  },

  // Normalization (ensure consistent data shape)
  normalizeMovement(raw: any): StockMovement {
    return {
      ...raw,
      quantity: parseFloat(raw.quantity),
      movement_type: raw.movement_type.toUpperCase(),
      created_at: raw.created_at || new Date().toISOString(),
    };
  },

  normalizeBalance(raw: any): StockBalance {
    return {
      ...raw,
      quantity_on_hand: parseFloat(raw.quantity_on_hand),
      status: raw.status?.toUpperCase() || 'UNKNOWN',
    };
  },

  normalizeBatch(raw: any): BatchRegistry {
    return {
      ...raw,
      quantity: parseFloat(raw.quantity),
      status: raw.status?.toUpperCase() || 'ACTIVE',
    };
  },
};