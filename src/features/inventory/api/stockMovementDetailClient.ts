/**
 * Stock Movement Detail API Client
 * Raw API calls for stock movement CRUD operations
 * 
 * Used by: stockMovementDetailService
 */

import apiClient from '../../../shared/services/api';
import { StockMovementDetailResponse, DeleteMovementResponse } from '../types/stockMovementDetail';
import { PaginatedResponse } from '../types/models';

const API_BASE = '/inventory/stock_movements';

/**
 * Fetch single stock movement detail by ID
 */
export const getStockMovementDetail = async (
  movementId: string
): Promise<StockMovementDetailResponse> => {
  const { data } = await apiClient.get<StockMovementDetailResponse>(
    `${API_BASE}/${movementId}`
  );
  return data;
};

/**
 * Delete stock movement
 */
export const deleteStockMovement = async (
  movementId: string
): Promise<DeleteMovementResponse> => {
  // Backend likely returns 204 No Content or 200 with empty body
  const response = await apiClient.delete(`${API_BASE}/${movementId}`);
  return {
    success: response.status === 204 || response.status === 200,
    message: response.statusText,
  };
};

/**
 * Fetch list of stock movements with pagination
 * Used for breadcrumb dropdown and navigation
 */
export const getStockMovementsList = async (
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedResponse<StockMovementDetailResponse>> => {
  const { data } = await apiClient.get<PaginatedResponse<StockMovementDetailResponse>>(
    API_BASE,
    {
      params: {
        page,
        page_size: pageSize,
      },
    }
  );
  return data;
};

export const stockMovementDetailClient = {
  getStockMovementDetail,
  deleteStockMovement,
  getStockMovementsList,
};

export default stockMovementDetailClient;
