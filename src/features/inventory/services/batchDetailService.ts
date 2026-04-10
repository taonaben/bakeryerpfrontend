/**
 * Batch Detail Service
 * Business logic layer between API client and store
 * Handles: normalization, cache validation, error handling
 * 
 * Used by: batchDetailStore
 * Uses: batchDetailClient
 */

import batchDetailClient from '../api/batchDetailClient';
import { BatchDetailResponse, UpdateBatchPayload } from '../types/batchDetail';
import { StockMovement } from '../types/models';

/**
 * Normalize batch response from API
 * - Ensure quantity is a number
 * - Ensure dates are ISO strings
 */
const normalizeBatch = (raw: any): BatchDetailResponse => {
  return {
    id: raw.id,
    product: raw.product,
    product_name: raw.product_name || '',
    warehouse: raw.warehouse,
    warehouse_name: raw.warehouse_name || '',
    batch_number: raw.batch_number,
    quantity: typeof raw.quantity === 'string' ? parseFloat(raw.quantity) : raw.quantity,
    manufacture_date: raw.manufacture_date,
    expiry_date: raw.expiry_date,
    rework_consumed: raw.rework_consumed || false,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
};

/**
 * Normalize movement response
 */
const normalizeMovement = (raw: any): StockMovement => {
  return {
    id: raw.id,
    warehouse: raw.warehouse,
    movement_type: raw.movement_type,
    reference_number: raw.reference_number,
    notes: raw.notes,
    total_quantity: raw.total_quantity,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    batches_detail: raw.batches_detail || [],
  };
};

export const batchDetailService = {
  /**
   * Fetch and normalize batch detail
   */
  async fetchBatchDetail(batchId: string): Promise<BatchDetailResponse> {
    try {
      const raw = await batchDetailClient.getBatchDetail(batchId);
      return normalizeBatch(raw);
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to fetch batch';
      throw new Error(message);
    }
  },

  /**
   * Update batch with validation
   */
  async updateBatch(
    batchId: string,
    payload: UpdateBatchPayload
  ): Promise<BatchDetailResponse> {
    // Validate payload
    if (payload.quantity !== undefined) {
      const qty = typeof payload.quantity === 'string' ? parseFloat(payload.quantity) : payload.quantity;
      if (isNaN(qty) || qty < 0) {
        throw new Error('Quantity must be a non-negative number');
      }
    }

    if (payload.manufacture_date && payload.expiry_date) {
      const mfg = new Date(payload.manufacture_date);
      const exp = new Date(payload.expiry_date);
      if (exp <= mfg) {
        throw new Error('Expiry date must be after manufacture date');
      }
    }

    try {
      const raw = await batchDetailClient.updateBatchDetail(batchId, payload);
      return normalizeBatch(raw);
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to update batch';
      throw new Error(message);
    }
  },

  /**
   * Delete batch
   */
  async deleteBatch(batchId: string): Promise<boolean> {
    try {
      const result = await batchDetailClient.deleteBatch(batchId);
      return result.success;
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to delete batch';
      throw new Error(message);
    }
  },

  /**
   * Fetch and normalize movements for batch
   */
  async fetchMovementsForBatch(
    batchId: string,
    page: number = 1
  ): Promise<{ movements: StockMovement[]; totalPages: number }> {
    try {
      const response = await batchDetailClient.getMovementsForBatch(batchId, page);
      const movements = response.results.map(normalizeMovement);
      const pageSize = 10; // Match API pageSize
      const totalPages = Math.ceil(response.count / pageSize);
      return { movements, totalPages };
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to fetch movements';
      throw new Error(message);
    }
  },
};

export default batchDetailService;
