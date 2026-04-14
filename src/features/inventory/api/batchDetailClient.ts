/**
 * Batch Detail API Client
 * Raw API calls for batch CRUD operations
 * 
 * Used by: batchDetailService
 */

import apiClient from '../../../shared/services/api';
import { BatchDetailResponse, UpdateBatchPayload, DeleteBatchResponse } from '../types/batchDetail';
import { PaginatedResponse, StockMovement } from '../types/models';

const API_BASE = '/inventory/batches';

/**
 * Fetch single batch detail by ID
 */
export const getBatchDetail = async (
  batchId: string
): Promise<BatchDetailResponse> => {
  const { data } = await apiClient.get<BatchDetailResponse>(
    `${API_BASE}/${batchId}`
  );
  return data;
};

/**
 * Update batch (PATCH - partial update)
 */
export const updateBatchDetail = async (
  batchId: string,
  payload: UpdateBatchPayload
): Promise<BatchDetailResponse> => {
  const { data } = await apiClient.patch<BatchDetailResponse>(
    `${API_BASE}/${batchId}`,
    payload
  );
  return data;
};

/**
 * Delete batch
 */
export const deleteBatch = async (
  batchId: string
): Promise<DeleteBatchResponse> => {
  // Backend likely returns 204 No Content or 200 with empty body
  const response = await apiClient.delete(`${API_BASE}/${batchId}`);
  return {
    success: response.status === 204 || response.status === 200,
    message: response.statusText,
  };
};

/**
 * Fetch movements for a specific batch
 * Uses the new endpoint: /inventory/batches/:id/movements
 */
export const getMovementsForBatch = async (
  batchId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<StockMovement>> => {
  const { data } = await apiClient.get<PaginatedResponse<StockMovement>>(
    `${API_BASE}/${batchId}/movements`,
    {
      params: {
        page,
        page_size: pageSize,
      },
    }
  );
  return data;
};

export const batchDetailClient = {
  getBatchDetail,
  updateBatchDetail,
  deleteBatch,
  getMovementsForBatch,
};

export default batchDetailClient;
