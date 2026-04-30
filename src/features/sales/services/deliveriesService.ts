import { deliveriesApi } from '../api/deliveries_client';
import type {
  Delivery,
  DeliveryDetail,
  ConfirmDeliveryDTO,
  FailDeliveryDTO,
  DeliveryFilters,
} from '../types/deliveries_models';

// ──────────────────────────────────────────────
// Deliveries Service
// ──────────────────────────────────────────────

export const deliveriesService = {
  async fetchAll(filters?: DeliveryFilters): Promise<Delivery[]> {
    const params = buildParams(filters);
    return deliveriesApi.getAll(params);
  },

  async fetchById(id: string): Promise<DeliveryDetail> {
    if (!id) throw new Error('Delivery ID is required');
    return deliveriesApi.getById(id);
  },

  async confirmReceipt(id: string, dto?: ConfirmDeliveryDTO): Promise<DeliveryDetail> {
    if (!id) throw new Error('Delivery ID is required');
    return deliveriesApi.confirmReceipt(id, dto);
  },

  async fail(id: string, dto: FailDeliveryDTO): Promise<DeliveryDetail> {
    if (!id) throw new Error('Delivery ID is required');
    if (!dto.reason?.trim()) throw new Error('Failure reason is required');
    return deliveriesApi.fail(id, dto);
  },
};

// ── Helpers ──────────────────────────────────

function buildParams(filters?: DeliveryFilters): Record<string, any> {
  const params: Record<string, any> = {};
  if (!filters) return params;
  if (filters.status) params.status = filters.status;
  if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.page) params.page = filters.page;
  if (filters.page_size) params.page_size = filters.page_size;
  return params;
}
