import { supplierInvoiceApi } from '../api/supplier_invoices';
import { grnService } from './grn_services';
import { useUserStore } from '../../auth/stores/userStore';
import type {
  SupplierInvoice,
  SupplierInvoiceLineItem,
  CreateSupplierInvoiceDTO,
  UpdateSupplierInvoiceDTO,
  SupplierInvoiceListFilters,
  SupplierInvoiceMatchLine,
  SupplierInvoiceMatchResult,
  SupplierInvoiceGoodsReceiptOption,
  SupplierInvoiceCreateContext,
  SupplierInvoiceCreateLineForm,
} from '../types/supplier_invoices_model';
import type { GoodsReceiptLineItem } from '../types/grn_models';

export const DEFAULT_SUPPLIER_INVOICE_FILTERS: SupplierInvoiceListFilters = {
  search: '',
  status: '',
  supplier_id: '',
  purchase_order_id: '',
  warehouse_id: '',
  invoice_date_after: '',
  invoice_date_before: '',
  due_date_after: '',
  due_date_before: '',
  ordering: '-created_at',
  page: 1,
  page_size: 25,
};

const toNumber = (value: unknown, fallback: number = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) return fallback;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export const supplierInvoiceService = {
  buildListQueryParams(
    filters?: Partial<SupplierInvoiceListFilters>,
    page: number = 1,
  ): Record<string, any> {
    const mergedFilters: SupplierInvoiceListFilters = {
      ...DEFAULT_SUPPLIER_INVOICE_FILTERS,
      ...(filters || {}),
    };

    const params: Record<string, any> = {};

    if (mergedFilters.search) params.search = mergedFilters.search;
    if (mergedFilters.status) params.status = mergedFilters.status;
    if (mergedFilters.supplier_id) params.supplier_id = mergedFilters.supplier_id;
    if (mergedFilters.purchase_order_id) params.purchase_order_id = mergedFilters.purchase_order_id;
    if (mergedFilters.warehouse_id) params.warehouse_id = mergedFilters.warehouse_id;

    if (mergedFilters.invoice_date_after && mergedFilters.invoice_date_before) {
      params.invoice_date__range = `${mergedFilters.invoice_date_after},${mergedFilters.invoice_date_before}`;
    } else if (mergedFilters.invoice_date_after) {
      params.invoice_date__gte = mergedFilters.invoice_date_after;
    } else if (mergedFilters.invoice_date_before) {
      params.invoice_date__lte = mergedFilters.invoice_date_before;
    }

    if (mergedFilters.due_date_after && mergedFilters.due_date_before) {
      params.due_date__range = `${mergedFilters.due_date_after},${mergedFilters.due_date_before}`;
    } else if (mergedFilters.due_date_after) {
      params.due_date__gte = mergedFilters.due_date_after;
    } else if (mergedFilters.due_date_before) {
      params.due_date__lte = mergedFilters.due_date_before;
    }

    if (mergedFilters.ordering) params.ordering = mergedFilters.ordering;
    params.page = mergedFilters.page || page;
    params.page_size = mergedFilters.page_size || 25;

    return params;
  },

  async fetchInvoices(
    filters?: Partial<SupplierInvoiceListFilters>,
    page: number = 1,
  ): Promise<{
    data: SupplierInvoice[];
    count: number;
    currentPage: number;
    totalPages: number;
  }> {
    const apiParams = this.buildListQueryParams(filters, page);
    const response = await supplierInvoiceApi.getInvoices(apiParams);
    const pageSize = apiParams.page_size || 25;
    const totalPages = Math.ceil(response.count / pageSize);

    return {
      data: response.results.map((invoice) => this.normalizeInvoice(invoice)),
      count: response.count,
      currentPage: apiParams.page || 1,
      totalPages,
    };
  },

  async fetchInvoice(id: string): Promise<SupplierInvoice> {
    if (!id) throw new Error('Supplier invoice ID is required');
    const raw = await supplierInvoiceApi.getInvoice(id);
    return this.normalizeInvoice(raw);
  },

  async createInvoice(dto: CreateSupplierInvoiceDTO): Promise<SupplierInvoice> {
    this.validateInvoice(dto);
    const created = await supplierInvoiceApi.createInvoice(dto);
    return this.normalizeInvoice(created);
  },

  async updateInvoice(id: string, dto: UpdateSupplierInvoiceDTO): Promise<SupplierInvoice> {
    if (!id) throw new Error('Supplier invoice ID is required');
    const updated = await supplierInvoiceApi.updateInvoice(id, dto);
    return this.normalizeInvoice(updated);
  },

  async patchInvoice(
    id: string,
    dto: Partial<UpdateSupplierInvoiceDTO>,
  ): Promise<SupplierInvoice> {
    if (!id) throw new Error('Supplier invoice ID is required');
    const updated = await supplierInvoiceApi.patchInvoice(id, dto);
    return this.normalizeInvoice(updated);
  },

  async deleteInvoice(id: string): Promise<void> {
    if (!id) throw new Error('Supplier invoice ID is required');
    await supplierInvoiceApi.deleteInvoice(id);
  },

  async approveInvoice(id: string): Promise<SupplierInvoice> {
    if (!id) throw new Error('Supplier invoice ID is required');
    const result = await supplierInvoiceApi.approveInvoice(id, {
      approved_by: this._getCurrentUserId(),
    });
    return this.normalizeInvoice(result);
  },

  async rejectInvoice(id: string, reason: string): Promise<SupplierInvoice> {
    if (!id) throw new Error('Supplier invoice ID is required');
    if (!reason?.trim()) throw new Error('Rejection reason is required');
    const result = await supplierInvoiceApi.rejectInvoice(id, {
      rejected_by: this._getCurrentUserId(),
      reason: reason.trim(),
    });
    return this.normalizeInvoice(result);
  },

  async markInvoicePaid(id: string, paymentReference: string): Promise<SupplierInvoice> {
    if (!id) throw new Error('Supplier invoice ID is required');
    if (!paymentReference?.trim()) throw new Error('Payment reference is required');
    const result = await supplierInvoiceApi.markInvoicePaid(id, {
      paid_by: this._getCurrentUserId(),
      payment_reference: paymentReference.trim(),
    });
    return this.normalizeInvoice(result);
  },

  async fetchInvoiceMatch(id: string): Promise<SupplierInvoiceMatchResult> {
    if (!id) throw new Error('Supplier invoice ID is required');
    const result = await supplierInvoiceApi.getInvoiceMatch(id);
    return this.normalizeMatchResult(result);
  },

  async fetchGoodsReceiptOptions(
    params?: Record<string, any>,
  ): Promise<SupplierInvoiceGoodsReceiptOption[]> {
    const response = await grnService.fetchReceipts({
      page: 1,
      page_size: 200,
      ordering: '-created_at',
      ...params,
    });

    return response.data.map((receipt) => ({
      id: receipt.id,
      gr_number: receipt.gr_number,
      purchase_order: receipt.purchase_order,
      purchase_order_number: receipt.purchase_order_number,
      supplier: receipt.supplier,
      supplier_name: receipt.supplier_name,
      warehouse: receipt.warehouse,
      warehouse_name: receipt.warehouse_name,
      received_date: receipt.received_date,
      status: receipt.status,
    }));
  },

  mapGRNLineToCreateLine(line: GoodsReceiptLineItem): SupplierInvoiceCreateLineForm {
    return {
      gr_line_item_id: line.id,
      product_id: line.product,
      product_name: line.product_name || '',
      quantity_received: toNumber(line.quantity_received),
      quantity_invoiced: '',
      unit_of_measure: line.unit_of_measure || '',
      unit_price: '',
      description: line.description || '',
    };
  },

  async getCreateFormData(goodsReceiptId: string): Promise<SupplierInvoiceCreateContext> {
    if (!goodsReceiptId) throw new Error('Goods receipt ID is required');
    const receipt = await grnService.fetchReceipt(goodsReceiptId);

    return {
      goodsReceiptId: receipt.id,
      goodsReceiptNumber: receipt.gr_number,
      purchaseOrderId: receipt.purchase_order,
      purchaseOrderNumber: receipt.purchase_order_number,
      supplierId: receipt.supplier,
      supplierName: receipt.supplier_name,
      warehouseId: receipt.warehouse,
      warehouseName: receipt.warehouse_name,
      invoiceDate: todayIso(),
      dueDate: todayIso(),
      lines: Array.isArray(receipt.line_items)
        ? receipt.line_items.map((line) => this.mapGRNLineToCreateLine(line))
        : [],
    };
  },

  normalizeInvoice(raw: any): SupplierInvoice {
    return {
      ...raw,
      total_amount: toNumber(raw.total_amount),
      status: raw.status || 'Draft',
      description: raw.description ?? null,
      approved_by: raw.approved_by ?? null,
      rejected_by: raw.rejected_by ?? null,
      rejection_reason: raw.rejection_reason ?? null,
      paid_by: raw.paid_by ?? null,
      payment_reference: raw.payment_reference ?? null,
      item_count: Number(raw.item_count) || 0,
      line_items: Array.isArray(raw.line_items)
        ? raw.line_items.map((line: any) => this.normalizeLineItem(line))
        : [],
    };
  },

  normalizeLineItem(raw: any): SupplierInvoiceLineItem {
    return {
      ...raw,
      quantity_invoiced: toNumber(raw.quantity_invoiced),
      unit_price: toNumber(raw.unit_price),
      total_price: toNumber(raw.total_price),
      unit_of_measure: raw.unit_of_measure || '',
      description: raw.description ?? null,
    };
  },

  normalizeMatchLine(raw: any): SupplierInvoiceMatchLine {
    return {
      invoice_line_id: raw.invoice_line_id || '',
      product_id: raw.product_id || '',
      product_name: raw.product_name || '',
      invoice_qty: toNumber(raw.invoice_qty),
      invoice_unit_price: toNumber(raw.invoice_unit_price),
      gr_qty: toNumber(raw.gr_qty),
      gr_unit_price: toNumber(raw.gr_unit_price),
      po_qty: toNumber(raw.po_qty),
      po_unit_price: toNumber(raw.po_unit_price),
      reason: raw.reason || '',
      price_diff_po: toNumber(raw.price_diff_po),
      price_diff_gr: toNumber(raw.price_diff_gr),
      qty_diff_gr: toNumber(raw.qty_diff_gr),
    };
  },

  normalizeMatchResult(raw: any): SupplierInvoiceMatchResult {
    return {
      matched: Array.isArray(raw?.matched)
        ? raw.matched.map((line: any) => this.normalizeMatchLine(line))
        : [],
      price_variance: Array.isArray(raw?.price_variance)
        ? raw.price_variance.map((line: any) => this.normalizeMatchLine(line))
        : [],
      qty_variance: Array.isArray(raw?.qty_variance)
        ? raw.qty_variance.map((line: any) => this.normalizeMatchLine(line))
        : [],
      unmatched: Array.isArray(raw?.unmatched)
        ? raw.unmatched.map((line: any) => this.normalizeMatchLine(line))
        : [],
    };
  },

  validateInvoice(dto: CreateSupplierInvoiceDTO): void {
    if (!dto.po_id) throw new Error('Purchase order is required');
    if (!dto.supplier_id) throw new Error('Supplier is required');
    if (!dto.invoice_date) throw new Error('Invoice date is required');
    if (!dto.due_date) throw new Error('Due date is required');
    if (!Array.isArray(dto.lines) || dto.lines.length === 0) {
      throw new Error('At least one line item is required');
    }

    dto.lines.forEach((line, index) => {
      if (!line.gr_line_item_id) {
        throw new Error(`Line ${index + 1}: Goods receipt line item is required`);
      }
      if (!line.product_id) throw new Error(`Line ${index + 1}: Product is required`);
      if (!line.quantity_invoiced || toNumber(line.quantity_invoiced) <= 0) {
        throw new Error(`Line ${index + 1}: Valid quantity invoiced is required`);
      }
      if (!line.unit_of_measure?.trim()) {
        throw new Error(`Line ${index + 1}: Unit of measure is required`);
      }
      if (!line.unit_price || toNumber(line.unit_price) < 0) {
        throw new Error(`Line ${index + 1}: Valid unit price is required`);
      }
    });
  },

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
};
