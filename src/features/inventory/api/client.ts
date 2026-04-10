import apiClient from '@/shared/services/api';
import type { 
  PaginatedResponse, 
  StockMovement, 
  StockBalance, 
  BatchRegistry,
  CreateMovementDTO 
} from '../types/models';

// Raw API calls - no caching, no state
export const inventoryApi = {
  getMovements: async (warehouseId: string, searchTerm?: string, page?: number): Promise<PaginatedResponse<StockMovement>> => {
    const { data } = await apiClient.get('/inventory/stock_movements', {
      params: { 
        warehouse_id: warehouseId,
        ...(searchTerm && { search: searchTerm }),
        ...(page && { page })
      }
    });
    return data;
  },

  createMovement: async (movement: CreateMovementDTO): Promise<StockMovement> => {
    const { data } = await apiClient.post('/inventory/stock_movements', movement);
    return data;
  },

  getBalances: async (warehouseId: string, searchTerm?: string, page?: number): Promise<PaginatedResponse<StockBalance>> => {
    const { data } = await apiClient.get('/inventory/stocks', {
      params: { 
        warehouse_id: warehouseId,
        ...(searchTerm && { search: searchTerm }),
        ...(page && { page })
      }
    });
    return data;
  },

  /**
   * Fetch batches with custom params
   * @param params - Full query parameters object including warehouse_id, filters, sorting, pagination
   * Example: { warehouse_id: 'wh1', batch_number__icontains: 'B123', page: 1, page_size: 25, ordering: '-expiry_date' }
   */
  getBatches: async (params: Record<string, any>): Promise<PaginatedResponse<BatchRegistry>> => {
    const { data } = await apiClient.get('/inventory/batches', {
      params
    });
    return data;
  },

  createBatch: async (batch: Omit<BatchRegistry, 'id'>): Promise<BatchRegistry> => {
    const { data } = await apiClient.post('/inventory/batches', batch);
    return data;
  }
};