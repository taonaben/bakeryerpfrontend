import apiClient from '@/shared/services/api';
import type {
  PaginatedResponse,
  PurchaseOrder,
  CreatePurchaseOrderDTO,
  UpdatePurchaseOrderDTO,
  SubmitPurchaseOrderDTO,
  ApprovePurchaseOrderDTO,
  RejectPurchaseOrderDTO,
  CancelPurchaseOrderDTO,
  RecalculateTotalDTO,
} from '../types/purchase_orders_models';

// Raw API calls — no caching, no state
export const purchaseOrderApi = {
  /** GET /purchasing/purchase-orders/ */
  getOrders: async (
    params: Record<string, any>,
  ): Promise<PaginatedResponse<PurchaseOrder>> => {
    const { data } = await apiClient.get('/purchasing/purchase-orders/', { params });
    return data;
  },

  /** GET /purchasing/purchase-orders/:id/ */
  getOrder: async (id: string): Promise<PurchaseOrder> => {
    const { data } = await apiClient.get(`/purchasing/purchase-orders/${id}/`);
    return data;
  },

  /** POST /purchasing/purchase-orders/ */
  createOrder: async (dto: CreatePurchaseOrderDTO): Promise<PurchaseOrder> => {
    const { data } = await apiClient.post('/purchasing/purchase-orders/', dto);
    return data;
  },

  /** PUT /purchasing/purchase-orders/:id/ */
  updateOrder: async (
    id: string,
    dto: UpdatePurchaseOrderDTO,
  ): Promise<PurchaseOrder> => {
    const { data } = await apiClient.put(`/purchasing/purchase-orders/${id}/`, dto);
    return data;
  },

  /** PATCH /purchasing/purchase-orders/:id/ */
  patchOrder: async (
    id: string,
    dto: Partial<UpdatePurchaseOrderDTO>,
  ): Promise<PurchaseOrder> => {
    const { data } = await apiClient.patch(`/purchasing/purchase-orders/${id}/`, dto);
    return data;
  },

  /** DELETE /purchasing/purchase-orders/:id/ */
  deleteOrder: async (id: string): Promise<void> => {
    await apiClient.delete(`/purchasing/purchase-orders/${id}/`);
  },

  // ─── Status Actions ─────────────────────────

  /** POST /purchasing/purchase-orders/:id/submit/ */
  submitOrder: async (id: string, dto: SubmitPurchaseOrderDTO): Promise<PurchaseOrder> => {
    const { data } = await apiClient.post(`/purchasing/purchase-orders/${id}/submit/`, dto);
    return data;
  },

  /** POST /purchasing/purchase-orders/:id/approve/ */
  approveOrder: async (id: string, dto: ApprovePurchaseOrderDTO): Promise<PurchaseOrder> => {
    const { data } = await apiClient.post(`/purchasing/purchase-orders/${id}/approve/`, dto);
    return data;
  },

  /** POST /purchasing/purchase-orders/:id/reject/ */
  rejectOrder: async (id: string, dto: RejectPurchaseOrderDTO): Promise<PurchaseOrder> => {
    const { data } = await apiClient.post(`/purchasing/purchase-orders/${id}/reject/`, dto);
    return data;
  },

  /** POST /purchasing/purchase-orders/:id/cancel/ */
  cancelOrder: async (id: string, dto: CancelPurchaseOrderDTO): Promise<PurchaseOrder> => {
    const { data } = await apiClient.post(`/purchasing/purchase-orders/${id}/cancel/`, dto);
    return data;
  },

  /** POST /purchasing/purchase-orders/:id/recalculate-total/ */
  recalculateTotal: async (id: string, dto: RecalculateTotalDTO): Promise<PurchaseOrder> => {
    const { data } = await apiClient.post(`/purchasing/purchase-orders/${id}/recalculate-total/`, dto);
    return data;
  },
};
