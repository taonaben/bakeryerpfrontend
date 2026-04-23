import { planningApi } from '../api/planningClient';
import type {
  PlannedOrder,
  CreatePlannedOrderDTO,
  UpdatePlannedOrderDTO,
  RequestPriorityOverrideDTO,
} from '../types/plannedOrderModel';

// ──────────────────────────────────────────────
// Planning Service
// Validation → API call → Normalisation
// ──────────────────────────────────────────────

export const planningService = {
  // ─── List ────────────────────────────────────
  async fetchPlannedOrders(
    filterParams?: Record<string, any>,
    page: number = 1,
  ): Promise<{
    data: PlannedOrder[];
    count: number;
    currentPage: number;
    totalPages: number;
  }> {
    const apiParams: Record<string, any> = {};

    if (filterParams && typeof filterParams === 'object') {
      Object.entries(filterParams).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          apiParams[key] = value;
        }
      });
    }

    if (apiParams.page === undefined) {
      apiParams.page = page;
    }

    if (apiParams.page_size === undefined) {
      apiParams.page_size = 25;
    }

    const response = await planningApi.getPlannedOrders(apiParams);
    const pageSize = apiParams.page_size || 25;
    const totalPages = Math.ceil(response.count / pageSize);

    return {
      data: response.results.map((r) => this.normalizePlannedOrder(r)),
      count: response.count,
      currentPage: apiParams.page || 1,
      totalPages,
    };
  },

  // ─── Detail ──────────────────────────────────
  async fetchPlannedOrder(id: string): Promise<PlannedOrder> {
    if (!id) throw new Error('Planned Order ID is required');
    const raw = await planningApi.getPlannedOrder(id);
    return this.normalizePlannedOrder(raw);
  },

  // ─── Create ──────────────────────────────────
  async createPlannedOrder(dto: CreatePlannedOrderDTO): Promise<PlannedOrder> {
    this.validatePlannedOrder(dto);
    const created = await planningApi.createPlannedOrder(dto);
    return this.normalizePlannedOrder(created);
  },

  // ─── Full Update (PUT) ──────────────────────
  async updatePlannedOrder(
    id: string,
    dto: UpdatePlannedOrderDTO,
  ): Promise<PlannedOrder> {
    if (!id) throw new Error('Planned Order ID is required');
    const updated = await planningApi.patchPlannedOrder(id, dto);
    return this.normalizePlannedOrder(updated);
  },

  // ─── Partial Update (PATCH) ─────────────────
  async patchPlannedOrder(
    id: string,
    dto: Partial<UpdatePlannedOrderDTO>,
  ): Promise<PlannedOrder> {
    if (!id) throw new Error('Planned Order ID is required');
    const updated = await planningApi.patchPlannedOrder(id, dto);
    return this.normalizePlannedOrder(updated);
  },

  // ─── Delete ──────────────────────────────────
  async deletePlannedOrder(id: string): Promise<void> {
    if (!id) throw new Error('Planned Order ID is required');
    await planningApi.deletePlannedOrder(id);
  },

  // ─── Priority Override ──────────────────────
  async requestPriorityOverride(
    id: string,
    dto: RequestPriorityOverrideDTO,
  ): Promise<PlannedOrder> {
    if (!id) throw new Error('Planned Order ID is required');
    const updated = await planningApi.requestPriorityOverride(id, dto);
    return this.normalizePlannedOrder(updated);
  },

  async approvePriorityOverride(id: string, approvedBy: string): Promise<PlannedOrder> {
    if (!id) throw new Error('Planned Order ID is required');
    const updated = await planningApi.approvePriorityOverride(id, { approved_by: approvedBy });
    return this.normalizePlannedOrder(updated);
  },

  async rejectPriorityOverride(
    id: string,
    rejectedBy: string,
    reason: string,
  ): Promise<PlannedOrder> {
    if (!id) throw new Error('Planned Order ID is required');
    const updated = await planningApi.rejectPriorityOverride(id, {
      rejected_by: rejectedBy,
      rejection_reason: reason,
    });
    return this.normalizePlannedOrder(updated);
  },

  // ─── Bulk Actions ──────────────────────────
  async bulkUpdatePriority(orderIds: string[], priority: string, note?: string) {
    if (!orderIds.length) throw new Error('No orders selected');
    const updated = await planningApi.bulkUpdatePriority({
      order_ids: orderIds,
      priority: priority as any,
      priority_override_note: note,
    });
    return updated.map((o) => this.normalizePlannedOrder(o));
  },

  async bulkUpdateWarehouse(orderIds: string[], warehouseId: string) {
    if (!orderIds.length) throw new Error('No orders selected');
    const updated = await planningApi.bulkUpdateWarehouse({
      order_ids: orderIds,
      warehouse: warehouseId,
    });
    return updated.map((o) => this.normalizePlannedOrder(o));
  },

  async bulkDelete(orderIds: string[]) {
    if (!orderIds.length) throw new Error('No orders selected');
    await planningApi.bulkDelete({ order_ids: orderIds });
  },

  // ─── Normalisation ──────────────────────────
  normalizePlannedOrder(raw: any): PlannedOrder {
    return {
      ...raw,
      quantity: typeof raw.quantity === 'string' ? parseFloat(raw.quantity) : raw.quantity,
      queue_position:
        typeof raw.queue_position === 'string'
          ? parseInt(raw.queue_position, 10)
          : raw.queue_position,
    };
  },

  // ─── Validation ──────────────────────────────
  validatePlannedOrder(dto: CreatePlannedOrderDTO): void {
    if (!dto.product) throw new Error('Product is required');
    if (!dto.quantity || (typeof dto.quantity === 'number' && dto.quantity <= 0)) {
      throw new Error('Quantity must be greater than 0');
    }
    if (!dto.warehouse) throw new Error('Warehouse is required');
    if (!dto.need_by) throw new Error('Need by date is required');
    if (new Date(dto.need_by) < new Date()) {
      throw new Error('Need by date cannot be in the past');
    }
    if (!dto.priority) throw new Error('Priority is required');
  },
};
