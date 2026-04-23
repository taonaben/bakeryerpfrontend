import apiClient from '@/shared/services/api';
import type {
  PaginatedResponse,
  PlannedOrder,
  CreatePlannedOrderDTO,
  UpdatePlannedOrderDTO,
  RequestPriorityOverrideDTO,
  ApprovePriorityOverrideDTO,
  RejectPriorityOverrideDTO,
  BulkUpdatePriorityDTO,
  BulkUpdateWarehouseDTO,
  BulkDeleteDTO,
} from '../types/plannedOrderModel';

// Raw API calls — no caching, no state
export const planningApi = {
  /** GET /plan_orders/planned */
  getPlannedOrders: async (
    params: Record<string, any>,
  ): Promise<PaginatedResponse<PlannedOrder>> => {
    const { data } = await apiClient.get('/plan_orders/planned', { params });
    return data;
  },

  /** GET /plan_orders/planned/{id} */
  getPlannedOrder: async (id: string): Promise<PlannedOrder> => {
    const { data } = await apiClient.get(`/plan_orders/planned/${id}`);
    return data;
  },

  /** POST /plan_orders/planned */
  createPlannedOrder: async (dto: CreatePlannedOrderDTO): Promise<PlannedOrder> => {
    const { data } = await apiClient.post('/plan_orders/planned', dto);
    return data;
  },

  /** PUT /plan_orders/planned/{id} */
  updatePlannedOrder: async (
    id: string,
    dto: UpdatePlannedOrderDTO,
  ): Promise<PlannedOrder> => {
    const { data } = await apiClient.put(`/plan_orders/planned/${id}`, dto);
    return data;
  },

  /** PATCH /plan_orders/planned/{id} */
  patchPlannedOrder: async (
    id: string,
    dto: Partial<UpdatePlannedOrderDTO>,
  ): Promise<PlannedOrder> => {
    const { data } = await apiClient.patch(`/plan_orders/planned/${id}`, dto);
    return data;
  },

  /** DELETE /plan_orders/planned/{id} */
  deletePlannedOrder: async (id: string): Promise<void> => {
    await apiClient.delete(`/plan_orders/planned/${id}`);
  },

  // ─── Priority Override Actions ─────────────────────────

  /** GET /plan_orders/planned/{id}/priority-approval */
  getPriorityApproval: async (
    id: string,
  ): Promise<PlannedOrder> => {
    const { data } = await apiClient.get(`/plan_orders/planned/${id}/priority-approval`);
    return data;
  },

  /** POST /plan_orders/planned/{id}/priority-approve */
  requestPriorityOverride: async (
    id: string,
    dto: RequestPriorityOverrideDTO,
  ): Promise<PlannedOrder> => {
    const { data } = await apiClient.post(
      `/plan_orders/planned/${id}/priority-approve`,
      dto,
    );
    return data;
  },

  /** POST /plan_orders/planned/{id}/priority-approve */
  approvePriorityOverride: async (
    id: string,
    dto: ApprovePriorityOverrideDTO,
  ): Promise<PlannedOrder> => {
    const { data } = await apiClient.post(
      `/plan_orders/planned/${id}/priority-approve`,
      dto,
    );
    return data;
  },

  /** POST /plan_orders/planned/{id}/priority-approve */
  rejectPriorityOverride: async (
    id: string,
    dto: RejectPriorityOverrideDTO,
  ): Promise<PlannedOrder> => {
    const { data } = await apiClient.post(
      `/plan_orders/planned/${id}/priority-approve`,
      dto,
    );
    return data;
  },

  // ─── Production Actions ───────────────────────────────

  /** POST /plan_orders/planned/{id}/create-production */
  createProduction: async (
    id: string,
  ): Promise<PlannedOrder> => {
    const { data } = await apiClient.post(`/plan_orders/planned/${id}/create-production`);
    return data;
  },

  /** POST /plan_orders/planned/{id}/create-production-plan */
  createProductionPlan: async (
    id: string,
  ): Promise<PlannedOrder> => {
    const { data } = await apiClient.post(`/plan_orders/planned/${id}/create-production-plan`);
    return data;
  },

  // ─── Bulk Actions ─────────────────────────────────────

  /** POST /plan_orders/planned/bulk-update-priority */
  bulkUpdatePriority: async (dto: BulkUpdatePriorityDTO): Promise<PlannedOrder[]> => {
    const { data } = await apiClient.post('/plan_orders/planned/bulk-update-priority', dto);
    return data;
  },

  /** POST /plan_orders/planned/bulk-update-warehouse */
  bulkUpdateWarehouse: async (dto: BulkUpdateWarehouseDTO): Promise<PlannedOrder[]> => {
    const { data } = await apiClient.post(
      '/plan_orders/planned/bulk-update-warehouse',
      dto,
    );
    return data;
  },

  /** POST /plan_orders/planned/bulk-delete */
  bulkDelete: async (dto: BulkDeleteDTO): Promise<void> => {
    await apiClient.post('/plan_orders/planned/bulk-delete', dto);
  },
};
