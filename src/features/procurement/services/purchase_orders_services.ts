import { purchaseOrderApi } from '../api/purchase_orders_client';
import { useUserStore } from '../../auth/stores/userStore';
import type {
  PurchaseOrder,
  PurchaseOrderLineItem,
  CreatePurchaseOrderDTO,
  UpdatePurchaseOrderDTO,
  RecalculateTotalDTO,
} from '../types/purchase_orders_models';

// ──────────────────────────────────────────────
// Purchase Order Service
// Validation → API call → Normalisation
// ──────────────────────────────────────────────

export const purchaseOrderService = {
  // ─── List ────────────────────────────────────
  async fetchOrders(
    filterParams?: Record<string, any>,
    page: number = 1,
  ): Promise<{
    data: PurchaseOrder[];
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
    } else {
      apiParams.page = page;
    }

    const response = await purchaseOrderApi.getOrders(apiParams);
    const pageSize = apiParams.page_size || 25;
    const totalPages = Math.ceil(response.count / pageSize);

    return {
      data: response.results.map((r) => this.normalizeOrder(r)),
      count: response.count,
      currentPage: apiParams.page || 1,
      totalPages,
    };
  },

  // ─── Detail ──────────────────────────────────
  async fetchOrder(id: string): Promise<PurchaseOrder> {
    if (!id) throw new Error('Purchase Order ID is required');
    const raw = await purchaseOrderApi.getOrder(id);
    return this.normalizeOrder(raw);
  },

  // ─── Create ──────────────────────────────────
  async createOrder(dto: CreatePurchaseOrderDTO): Promise<PurchaseOrder> {
    this.validateOrder(dto);
    const created = await purchaseOrderApi.createOrder(dto);
    return this.normalizeOrder(created);
  },

  // ─── Full Update (PUT) ──────────────────────
  async updateOrder(
    id: string,
    dto: UpdatePurchaseOrderDTO,
  ): Promise<PurchaseOrder> {
    if (!id) throw new Error('Purchase Order ID is required');
    const updated = await purchaseOrderApi.updateOrder(id, dto);
    return this.normalizeOrder(updated);
  },

  // ─── Partial Update (PATCH) ─────────────────
  async patchOrder(
    id: string,
    dto: Partial<UpdatePurchaseOrderDTO>,
  ): Promise<PurchaseOrder> {
    if (!id) throw new Error('Purchase Order ID is required');
    const updated = await purchaseOrderApi.patchOrder(id, dto);
    return this.normalizeOrder(updated);
  },

  // ─── Delete ──────────────────────────────────
  async deleteOrder(id: string): Promise<void> {
    if (!id) throw new Error('Purchase Order ID is required');
    await purchaseOrderApi.deleteOrder(id);
  },

  // ─── Normalisation ──────────────────────────
  normalizeOrder(raw: any): PurchaseOrder {
    return {
      ...raw,
      status: raw.status || 'Draft',
      total_amount: parseFloat(raw.total_amount) || 0,
      line_items: Array.isArray(raw.line_items)
        ? raw.line_items.map((li: any) => this.normalizeLineItem(li))
        : [],
      submitted_by: raw.submitted_by ?? null,
      submitted_at: raw.submitted_at ?? null,
      approved_by: raw.approved_by ?? null,
      approved_at: raw.approved_at ?? null,
      rejected_by: raw.rejected_by ?? null,
      rejected_at: raw.rejected_at ?? null,
      rejection_reason: raw.rejection_reason ?? null,
      cancelled_by: raw.cancelled_by ?? null,
      cancelled_at: raw.cancelled_at ?? null,
      purchase_requisition: raw.purchase_requisition ?? null,
      pr_number: raw.pr_number ?? null,
      expected_delivery_date: raw.expected_delivery_date ?? null,
    };
  },

  normalizeLineItem(raw: any): PurchaseOrderLineItem {
    return {
      ...raw,
      quantity: parseFloat(raw.quantity) || 0,
      unit_price: parseFloat(raw.unit_price) || 0,
      total_price: parseFloat(raw.total_price) || 0,
      quantity_received: parseFloat(raw.quantity_received) || 0,
      unit_of_measure: raw.unit_of_measure || '',
      description: raw.description || '',
    };
  },

  // ─── Validation ─────────────────────────────
  validateOrder(dto: CreatePurchaseOrderDTO): void {
    if (!dto.supplier_id) throw new Error('Supplier is required');
    if (!dto.warehouse_id) throw new Error('Warehouse is required');
    if (!dto.currency?.trim()) throw new Error('Currency is required');
    if (!Array.isArray(dto.lines) || dto.lines.length === 0) {
      throw new Error('At least one line item is required');
    }
    dto.lines.forEach((line, i) => {
      if (!line.product_id) throw new Error(`Line ${i + 1}: Product is required`);
      if (!line.quantity || parseFloat(line.quantity) <= 0) {
        throw new Error(`Line ${i + 1}: Valid quantity is required`);
      }
      if (!line.unit_price || parseFloat(line.unit_price) <= 0) {
        throw new Error(`Line ${i + 1}: Valid unit price is required`);
      }
    });
  },

  // ─── Status Actions ─────────────────────────

  /** Get the current authenticated user's ID */
  _getCurrentUserId(): string {
    // Try Zustand store first
    const storeUser = useUserStore.getState().user;
    if (storeUser?.id) return storeUser.id;

    // Fallback to localStorage (store isn't populated on page refresh)
    const saved = localStorage.getItem('erp_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed.id;
      } catch {
        // ignore parse errors
      }
    }

    throw new Error('You must be logged in to perform this action');
  },

  /** Submit a draft PO for approval */
  async submitOrder(id: string): Promise<PurchaseOrder> {
    if (!id) throw new Error('Purchase Order ID is required');
    const result = await purchaseOrderApi.submitOrder(id, {
      submitted_by: this._getCurrentUserId(),
    });
    return this.normalizeOrder(result);
  },

  /** Approve a submitted PO */
  async approveOrder(id: string): Promise<PurchaseOrder> {
    if (!id) throw new Error('Purchase Order ID is required');
    const result = await purchaseOrderApi.approveOrder(id, {
      approved_by: this._getCurrentUserId(),
    });
    return this.normalizeOrder(result);
  },

  /** Reject a submitted PO */
  async rejectOrder(id: string, reason: string): Promise<PurchaseOrder> {
    if (!id) throw new Error('Purchase Order ID is required');
    if (!reason?.trim()) throw new Error('Rejection reason is required');
    const result = await purchaseOrderApi.rejectOrder(id, {
      rejected_by: this._getCurrentUserId(),
      reason: reason.trim(),
    });
    return this.normalizeOrder(result);
  },

  /** Cancel a PO */
  async cancelOrder(id: string): Promise<PurchaseOrder> {
    if (!id) throw new Error('Purchase Order ID is required');
    const result = await purchaseOrderApi.cancelOrder(id, {
      cancelled_by: this._getCurrentUserId(),
    });
    return this.normalizeOrder(result);
  },

  /** Recalculate PO total */
  async recalculateTotal(id: string, dto: RecalculateTotalDTO): Promise<PurchaseOrder> {
    if (!id) throw new Error('Purchase Order ID is required');
    const result = await purchaseOrderApi.recalculateTotal(id, dto);
    return this.normalizeOrder(result);
  },

  // ─── Purchase Order Line Endpoints ───────────────
  async getLine(id: string) {
    if (!id) throw new Error('Line ID is required');
    const raw = await purchaseOrderApi.getLine(id);
    return this.normalizeLineItem(raw);
  },

  async patchLine(id: string, dto: Partial<any>) {
    if (!id) throw new Error('Line ID is required');
    const updated = await purchaseOrderApi.patchLine(id, dto);
    return this.normalizeLineItem(updated);
  },

  async updateLine(id: string, dto: any) {
    if (!id) throw new Error('Line ID is required');
    const updated = await purchaseOrderApi.updateLine(id, dto);
    return this.normalizeLineItem(updated);
  },

  async deleteLine(id: string) {
    if (!id) throw new Error('Line ID is required');
    await purchaseOrderApi.deleteLine(id);
  },
};
