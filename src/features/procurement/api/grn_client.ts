import apiClient from '@/shared/services/api';
import type {
  PaginatedResponse,
  GoodsReceipt,
  CreateGoodsReceiptDTO,
  UpdateGoodsReceiptDTO,
  ConfirmGoodsReceiptDTO,
  RejectGoodsReceiptDTO,
} from '../types/grn_models';

// Raw API calls — no caching, no state
export const grnApi = {
  /** GET /purchasing/goods-receipts/ */
  getReceipts: async (
    params: Record<string, any>,
  ): Promise<PaginatedResponse<GoodsReceipt>> => {
    const { data } = await apiClient.get('/purchasing/goods-receipts/', { params });
    return data;
  },

  /** GET /purchasing/goods-receipts/:id/ */
  getReceipt: async (id: string): Promise<GoodsReceipt> => {
    const { data } = await apiClient.get(`/purchasing/goods-receipts/${id}/`);
    return data;
  },

  /** POST /purchasing/goods-receipts/ */
  createReceipt: async (dto: CreateGoodsReceiptDTO): Promise<GoodsReceipt> => {
    const { data } = await apiClient.post('/purchasing/goods-receipts/', dto);
    return data;
  },

  /** PUT /purchasing/goods-receipts/:id/ */
  updateReceipt: async (id: string, dto: UpdateGoodsReceiptDTO): Promise<GoodsReceipt> => {
    const { data } = await apiClient.put(`/purchasing/goods-receipts/${id}/`, dto);
    return data;
  },

  /** PATCH /purchasing/goods-receipts/:id/ */
  patchReceipt: async (
    id: string,
    dto: Partial<UpdateGoodsReceiptDTO>,
  ): Promise<GoodsReceipt> => {
    const { data } = await apiClient.patch(`/purchasing/goods-receipts/${id}/`, dto);
    return data;
  },

  /** DELETE /purchasing/goods-receipts/:id/ */
  deleteReceipt: async (id: string): Promise<void> => {
    await apiClient.delete(`/purchasing/goods-receipts/${id}/`);
  },

  /** POST /purchasing/goods-receipts/:id/confirm/ */
  confirmReceipt: async (id: string, dto: ConfirmGoodsReceiptDTO): Promise<GoodsReceipt> => {
    const { data } = await apiClient.post(`/purchasing/goods-receipts/${id}/confirm/`, dto);
    return data;
  },

  /** POST /purchasing/goods-receipts/:id/reject/ */
  rejectReceipt: async (id: string, dto: RejectGoodsReceiptDTO): Promise<GoodsReceipt> => {
    const { data } = await apiClient.post(`/purchasing/goods-receipts/${id}/reject/`, dto);
    return data;
  },
};
