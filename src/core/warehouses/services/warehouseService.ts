import apiClient from '@/shared/services/api';
import type { Warehouse } from '../types/models';

/**
 * WAREHOUSE SERVICE
 * 
 * Handles warehouse-related API calls.
 */

export const warehouseService = {
  /**
   * Get all warehouses (for superadmin only, typically)
   */
  async getWarehouses(): Promise<Warehouse[]> {
    const response = await apiClient.get('/warehouses');
    const data = response.data as any;
    return data.results || data;
  },

  /**
   * Get warehouses for a specific company
   */
  async getWarehousesByCompany(companyId: string): Promise<Warehouse[]> {
    const response = await apiClient.get(
      `/warehouses?company_id=${companyId}`
    );
    
    const data = response.data as any;
    return data.results || data;
  },

  /**
   * Get a specific warehouse by ID
   */
  async getWarehouse(warehouseId: string): Promise<Warehouse> {
    const response = await apiClient.get<Warehouse>(`/warehouses/${warehouseId}`);
    return response.data;
  },
};
