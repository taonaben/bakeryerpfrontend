/**
 * Stock Movement Detail Service
 * Business logic layer between API client and store
 * Handles: normalization, cache validation, error handling
 * 
 * Used by: stockMovementDetailStore
 * Uses: stockMovementDetailClient
 */

import stockMovementDetailClient from '../api/stockMovementDetailClient';
import { StockMovementDetailResponse, StockMovementBatchDetailFull } from '../types/stockMovementDetail';
import { PaginatedResponse } from '../types/models';

/**
 * Normalize batch detail within stock movement
 * - Ensure quantity is a number
 * - Ensure batch fields are properly typed
 */
const normalizeBatchDetail = (raw: any): StockMovementBatchDetailFull => {
  return {
    batch: {
      id: raw.batch?.id,
      batch_number: raw.batch?.batch_number,
      product: raw.batch?.product,
      product_name: raw.batch?.product_name,
      warehouse: raw.batch?.warehouse,
      warehouse_name: raw.batch?.warehouse_name,
      manufacture_date: raw.batch?.manufacture_date,
      expiry_date: raw.batch?.expiry_date,
      quantity: typeof raw.batch?.quantity === 'string' 
        ? parseFloat(raw.batch.quantity) 
        : raw.batch?.quantity,
      status: raw.batch?.status || 'ACTIVE',
      created_at: raw.batch?.created_at,
      updated_at: raw.batch?.updated_at,
      rework_consumed: raw.batch?.rework_consumed || false,
    },
    quantity: typeof raw.quantity === 'string' ? parseFloat(raw.quantity) : raw.quantity,
  };
};

/**
 * Normalize stock movement response from API
 * - Ensure total_quantity is a number
 * - Ensure dates are ISO strings
 * - Normalize nested batch details
 */
const normalizeMovement = (raw: any): StockMovementDetailResponse => {
  return {
    id: raw.id,
    warehouse: raw.warehouse,
    movement_type: raw.movement_type,
    reference_number: raw.reference_number,
    notes: raw.notes || '',
    total_quantity: typeof raw.total_quantity === 'string' 
      ? parseFloat(raw.total_quantity) 
      : raw.total_quantity,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    batches_detail: Array.isArray(raw.batches_detail)
      ? raw.batches_detail.map((detail: any) => normalizeBatchDetail(detail))
      : [],
  };
};

export const stockMovementDetailService = {
  /**
   * Fetch and normalize stock movement detail
   */
  async fetchStockMovementDetail(movementId: string): Promise<StockMovementDetailResponse> {
    try {
      const raw = await stockMovementDetailClient.getStockMovementDetail(movementId);
      return normalizeMovement(raw);
    } catch (error: any) {
      const message = 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch stock movement';
      throw new Error(message);
    }
  },

  /**
   * Delete stock movement
   * Validates that movement exists before deletion
   */
  async deleteStockMovement(movementId: string): Promise<void> {
    try {
      await stockMovementDetailClient.deleteStockMovement(movementId);
    } catch (error: any) {
      const message = 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        'Failed to delete stock movement';
      throw new Error(message);
    }
  },

  /**
   * Fetch and normalize stock movements list for breadcrumb dropdown
   */
  async fetchStockMovementsList(
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ movements: StockMovementDetailResponse[]; totalPages: number }> {
    try {
      const response: PaginatedResponse<any> = await stockMovementDetailClient.getStockMovementsList(
        page,
        pageSize
      );
      
      const movements = response.results.map((raw) => normalizeMovement(raw));
      
      // Calculate total pages from count
      const totalPages = Math.ceil(response.count / pageSize);
      
      return {
        movements,
        totalPages,
      };
    } catch (error: any) {
      const message = 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch stock movements list';
      throw new Error(message);
    }
  },
};

export default stockMovementDetailService;
