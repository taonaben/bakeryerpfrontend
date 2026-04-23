import { grnApi } from '../api/grn_client';
import { useUserStore } from '../../auth/stores/userStore';
import { purchaseOrderService } from './purchase_orders_services';
import type {
  GoodsReceipt,
  GoodsReceiptLineItem,
  CreateGoodsReceiptDTO,
  UpdateGoodsReceiptDTO,
  GoodsReceiptListFilters,
  GoodsReceiptPurchaseOrderOption,
  GoodsReceiptCreateLineForm,
} from '../types/grn_models';
import type { PurchaseOrderLineItem } from '../types/purchase_orders_models';

export const DEFAULT_GRN_FILTERS: GoodsReceiptListFilters = {
  search: '',
  status: '',
  purchase_order_id: '',
  warehouse_id: '',
  received_date_after: '',
  received_date_before: '',
  ordering: '-created_at',
  page: 1,
  page_size: 25,
};

export const grnService = {
  // ─── List ────────────────────────────────────
  buildListQueryParams(
    filters?: Partial<GoodsReceiptListFilters>,
    page: number = 1,
  ): Record<string, any> {
    const mergedFilters: GoodsReceiptListFilters = {
      ...DEFAULT_GRN_FILTERS,
      ...(filters || {}),
    };

    const params: Record<string, any> = {};
    if (mergedFilters.search) params.search = mergedFilters.search;
    if (mergedFilters.status) params.status = mergedFilters.status;
    if (mergedFilters.purchase_order_id) params.purchase_order_id = mergedFilters.purchase_order_id;
    if (mergedFilters.warehouse_id) params.warehouse_id = mergedFilters.warehouse_id;

    if (mergedFilters.received_date_after && mergedFilters.received_date_before) {
      params.received_date__range = `${mergedFilters.received_date_after},${mergedFilters.received_date_before}`;
    } else if (mergedFilters.received_date_after) {
      params.received_date__gte = mergedFilters.received_date_after;
    } else if (mergedFilters.received_date_before) {
      params.received_date__lte = mergedFilters.received_date_before;
    }

    if (mergedFilters.ordering) params.ordering = mergedFilters.ordering;
    params.page = mergedFilters.page || page;
    params.page_size = mergedFilters.page_size || 25;
    return params;
  },

  async fetchReceipts(
    filters?: Partial<GoodsReceiptListFilters>,
    page: number = 1,
  ): Promise<{
    data: GoodsReceipt[];
    count: number;
    currentPage: number;
    totalPages: number;
  }> {
    const apiParams = this.buildListQueryParams(filters, page);
    const response = await grnApi.getReceipts(apiParams);
    const pageSize = apiParams.page_size || 25;
    const totalPages = Math.ceil(response.count / pageSize);

    return {
      data: response.results.map((r) => this.normalizeReceipt(r)),
      count: response.count,
      currentPage: apiParams.page || 1,
      totalPages,
    };
  },

  async fetchPurchaseOrderOptions(
    params?: Record<string, any>,
  ): Promise<GoodsReceiptPurchaseOrderOption[]> {
    const response = await purchaseOrderService.fetchOrders({
      page: 1,
      page_size: 200,
      ordering: '-created_at',
      ...params,
    });

    return response.data.map((order) => ({
      id: order.id,
      po_number: order.po_number,
      supplier_name: order.supplier_name,
      warehouse: order.warehouse,
      warehouse_name: order.warehouse_name,
      status: order.status,
    }));
  },

  mapPOLineToCreateLine(line: PurchaseOrderLineItem): GoodsReceiptCreateLineForm {
    const quantityOrdered = parseFloat(String(line.quantity)) || 0;
    const quantityAlreadyReceived = parseFloat(String(line.quantity_received)) || 0;
    const quantityRemaining = Math.max(0, quantityOrdered - quantityAlreadyReceived);

    return {
      po_line_item_id: line.id,
      product_id: line.product,
      product_name: line.product_name || '',
      quantity_ordered: quantityOrdered,
      quantity_already_received: quantityAlreadyReceived,
      quantity_remaining: quantityRemaining,
      quantity_received: '',
      unit_of_measure: line.unit_of_measure || '',
      supplier_batch_ref: '',
      expiry_date: '',
      manufacturing_date: '',
      description: line.description || '',
    };
  },

  async getCreateFormData(poId: string): Promise<{
    purchaseOrderId: string;
    warehouseId: string;
    purchaseOrderNumber: string;
    supplierName: string;
    lines: GoodsReceiptCreateLineForm[];
  }> {
    if (!poId) throw new Error('Purchase order ID is required');
    const order = await purchaseOrderService.fetchOrder(poId);
    return {
      purchaseOrderId: order.id,
      warehouseId: order.warehouse,
      purchaseOrderNumber: order.po_number,
      supplierName: order.supplier_name,
      lines: Array.isArray(order.line_items)
        ? order.line_items.map((line) => this.mapPOLineToCreateLine(line))
        : [],
    };
  },

  // ─── Detail ──────────────────────────────────
  async fetchReceipt(id: string): Promise<GoodsReceipt> {
    if (!id) throw new Error('Goods receipt ID is required');
    const raw = await grnApi.getReceipt(id);
    return this.normalizeReceipt(raw);
  },

  // ─── Create ──────────────────────────────────
  async createReceipt(dto: CreateGoodsReceiptDTO): Promise<GoodsReceipt> {
    this.validateReceipt(dto);
    const payload: CreateGoodsReceiptDTO = {
      ...dto,
      received_by: dto.received_by || this._getCurrentUserId(),
    };
    const created = await grnApi.createReceipt(payload);
    return this.normalizeReceipt(created);
  },

  // ─── Full Update (PUT) ──────────────────────
  async updateReceipt(id: string, dto: UpdateGoodsReceiptDTO): Promise<GoodsReceipt> {
    if (!id) throw new Error('Goods receipt ID is required');
    const updated = await grnApi.updateReceipt(id, dto);
    return this.normalizeReceipt(updated);
  },

  // ─── Partial Update (PATCH) ─────────────────
  async patchReceipt(id: string, dto: Partial<UpdateGoodsReceiptDTO>): Promise<GoodsReceipt> {
    if (!id) throw new Error('Goods receipt ID is required');
    const updated = await grnApi.patchReceipt(id, dto);
    return this.normalizeReceipt(updated);
  },

  // ─── Delete ──────────────────────────────────
  async deleteReceipt(id: string): Promise<void> {
    if (!id) throw new Error('Goods receipt ID is required');
    await grnApi.deleteReceipt(id);
  },

  // ─── Normalisation ──────────────────────────
  normalizeReceipt(raw: any): GoodsReceipt {
    return {
      ...raw,
      status: raw.status || 'Draft',
      item_count: Number(raw.item_count) || 0,
      description: raw.description ?? null,
      rejection_reason: raw.rejection_reason ?? null,
      line_items: Array.isArray(raw.line_items)
        ? raw.line_items.map((li: any) => this.normalizeLineItem(li))
        : [],
    };
  },

  normalizeLineItem(raw: any): GoodsReceiptLineItem {
    return {
      ...raw,
      quantity_received: parseFloat(raw.quantity_received) || 0,
      unit_of_measure: raw.unit_of_measure || '',
      supplier_batch_ref: raw.supplier_batch_ref ?? null,
      expiry_date: raw.expiry_date ?? null,
      manufacturing_date: raw.manufacturing_date ?? null,
      description: raw.description ?? null,
    };
  },

  // ─── Validation ─────────────────────────────
  validateReceipt(dto: CreateGoodsReceiptDTO): void {
    if (!dto.purchase_order_id) throw new Error('Purchase order is required');
    if (!dto.warehouse_id) throw new Error('Warehouse is required');
    if (!Array.isArray(dto.lines) || dto.lines.length === 0) {
      throw new Error('At least one line item is required');
    }
    dto.lines.forEach((line, i) => {
      if (!line.po_line_item_id) throw new Error(`Line ${i + 1}: PO line item is required`);
      if (!line.quantity_received || parseFloat(line.quantity_received) <= 0) {
        throw new Error(`Line ${i + 1}: Valid quantity received is required`);
      }
      if (!line.unit_of_measure?.trim()) {
        throw new Error(`Line ${i + 1}: Unit of measure is required`);
      }
    });
  },

  // ─── Status Actions ─────────────────────────
  _getCurrentUserId(): string {
    const storeUser = useUserStore.getState().user;
    if (storeUser?.id) return storeUser.id;

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

  async confirmReceipt(id: string): Promise<GoodsReceipt> {
    if (!id) throw new Error('Goods receipt ID is required');
    const result = await grnApi.confirmReceipt(id, {
      confirmed_by: this._getCurrentUserId(),
    });
    return this.normalizeReceipt(result);
  },

  async rejectReceipt(id: string, reason: string): Promise<GoodsReceipt> {
    if (!id) throw new Error('Goods receipt ID is required');
    if (!reason?.trim()) throw new Error('Rejection reason is required');
    const result = await grnApi.rejectReceipt(id, {
      rejected_by: this._getCurrentUserId(),
      reason: reason.trim(),
    });
    return this.normalizeReceipt(result);
  },
};
