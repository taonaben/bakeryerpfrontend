import type { Timestamp, PaginatedResponse } from './models';
export type { PaginatedResponse };

// ──────────────────────────────────────────────
// Purchase Order Status
// ──────────────────────────────────────────────

export type PurchaseOrderStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Rejected'
  | 'Partially Received'
  | 'Received'
  | 'Cancelled';

// ──────────────────────────────────────────────
// API Response Shapes (GET)
// ──────────────────────────────────────────────

export interface PurchaseOrderLineItem extends Timestamp {
  id: string;
  purchase_order: string;
  product: string;
  product_name: string;
  quantity: number | string;
  unit_of_measure: string;
  unit_price: number | string;
  total_price: number | string;
  quantity_received: number | string;
  description: string;
}

export interface PurchaseOrder extends Timestamp {
  id: string;
  po_number: string;
  pr_number: string | null;
  supplier: string;
  supplier_name: string;
  warehouse: string;
  warehouse_name: string;
  purchase_requisition: string | null;
  created_by: string;
  order_date: string;
  expected_delivery_date: string | null;
  currency: string;
  description: string;
  total_amount: number | string;
  status: PurchaseOrderStatus;
  item_count: number;

  submitted_by: string | null;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;

  line_items: PurchaseOrderLineItem[];
}

// ──────────────────────────────────────────────
// DTOs – POST / PUT / PATCH payloads
// ──────────────────────────────────────────────

export interface CreatePurchaseOrderLineDTO {
  product_id: string;
  supplier_id: string;     // which supplier this line is sourced from
  quantity: string;
  unit_of_measure: string;
  quoted_price: string;    // supplier catalogue price (pre-filled reference)
  unit_price: string;      // actual agreed price for this order (editable)
  description?: string;
}

export interface CreatePurchaseOrderDTO {
  supplier_id: string;
  warehouse_id: string;
  purchase_requisition_id?: string;
  currency: string;
  description?: string;
  expected_delivery_date?: string;
  lines: CreatePurchaseOrderLineDTO[];
}

export type UpdatePurchaseOrderDTO = Partial<CreatePurchaseOrderDTO>;

// ──────────────────────────────────────────────
// Status-Action DTOs
// ──────────────────────────────────────────────

export interface SubmitPurchaseOrderDTO {
  submitted_by: string;
}

export interface ApprovePurchaseOrderDTO {
  approved_by: string;
}

export interface RejectPurchaseOrderDTO {
  rejected_by: string;
  reason: string;
}

export interface CancelPurchaseOrderDTO {
  cancelled_by: string;
}

export interface RecalculateTotalDTO {
  supplier: string;
  warehouse: string;
  purchase_requisition?: string;
  expected_delivery_date?: string;
  currency: string;
  description?: string;
  rejection_reason?: string;
}
