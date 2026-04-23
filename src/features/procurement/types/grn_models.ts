import type { Timestamp, PaginatedResponse } from './models';
export type { PaginatedResponse };

// ──────────────────────────────────────────────
// Goods Receipt Status
// ──────────────────────────────────────────────

export type GoodsReceiptStatus =
  | 'Draft'
  | 'Confirmed'
  | 'Rejected'
  | 'Partially Received'
  | 'Received';

// ──────────────────────────────────────────────
// API Response Shapes (GET)
// ──────────────────────────────────────────────

export interface GoodsReceiptLineItem extends Timestamp {
  id: string;
  goods_receipt: string;
  po_line_item: string;
  product: string;
  product_name: string;
  quantity_received: number | string;
  unit_of_measure: string;
  supplier_batch_ref: string | null;
  expiry_date: string | null;
  manufacturing_date: string | null;
  description: string | null;
}

export interface GoodsReceipt extends Timestamp {
  id: string;
  gr_number: string;
  purchase_order: string;
  purchase_order_number: string;
  supplier_name: string;
  supplier: string;
  warehouse: string;
  warehouse_name: string;
  received_date: string;
  received_by: string;
  received_by_name: string;
  status: GoodsReceiptStatus;
  description: string | null;
  rejection_reason: string | null;
  item_count: number;
  line_items: GoodsReceiptLineItem[];
}

// ──────────────────────────────────────────────
// DTOs – POST / PUT / PATCH payloads
// ──────────────────────────────────────────────

export interface CreateGoodsReceiptLineDTO {
  po_line_item_id: string;
  quantity_received: string;
  unit_of_measure: string;
  supplier_batch_ref?: string;
  expiry_date?: string;
  manufacturing_date?: string;
  description?: string;
}

export interface CreateGoodsReceiptDTO {
  purchase_order_id: string;
  warehouse_id: string;
  received_by?: string;
  lines: CreateGoodsReceiptLineDTO[];
}

export type UpdateGoodsReceiptDTO = Partial<CreateGoodsReceiptDTO>;

// ──────────────────────────────────────────────
// Status-Action DTOs
// ──────────────────────────────────────────────

export interface ConfirmGoodsReceiptDTO {
  confirmed_by: string;
}

export interface RejectGoodsReceiptDTO {
  rejected_by: string;
  reason: string;
}

// ──────────────────────────────────────────────
// Table/List Filters
// ──────────────────────────────────────────────

export interface GoodsReceiptListFilters {
  search: string;
  status: GoodsReceiptStatus | '';
  purchase_order_id: string;
  warehouse_id: string;
  received_date_after: string;
  received_date_before: string;
  ordering: string;
  page: number;
  page_size: number;
}

// ──────────────────────────────────────────────
// Create Form Support Models
// ──────────────────────────────────────────────

export interface GoodsReceiptPurchaseOrderOption {
  id: string;
  po_number: string;
  supplier_name: string;
  warehouse: string;
  warehouse_name: string;
  status: string;
}

export interface GoodsReceiptCreateLineForm {
  po_line_item_id: string;
  product_id: string;
  product_name: string;
  quantity_ordered: number;
  quantity_already_received: number;
  quantity_remaining: number;
  quantity_received: string;
  unit_of_measure: string;
  supplier_batch_ref: string;
  expiry_date: string;
  manufacturing_date: string;
  description: string;
}
