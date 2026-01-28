import apiClient from '../../../shared/services/api.js';
import type { 
  PaginatedResponse, 
  StockMovement, 
  StockBalance, 
  BatchRegistry,
  CreateMovementDTO 
} from '../types/models';

// Raw API calls - no caching, no state
export const inventoryApi = {
  getMovements: async (warehouseId: string): Promise<PaginatedResponse<StockMovement>> => {
    const { data } = await apiClient.get('/inventory/stock_movements', {
      params: { warehouse_id: warehouseId }
    });
    return data;
  },

  createMovement: async (movement: CreateMovementDTO): Promise<StockMovement> => {
    const { data } = await apiClient.post('/inventory/stock_movements', movement);
    return data;
  },

  getBalances: async (warehouseId: string): Promise<PaginatedResponse<StockBalance>> => {
    const { data } = await apiClient.get('/inventory/stocks', {
      params: { warehouse_id: warehouseId }
    });
    return data;
  },

  getBatches: async (warehouseId: string): Promise<PaginatedResponse<BatchRegistry>> => {
    const { data } = await apiClient.get('/inventory/batches', {
      params: { warehouse_id: warehouseId }
    });
    return data;
  },
};