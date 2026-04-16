// ──────────────────────────────────────────────
// Procurement – Shared primitives
// ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Timestamp {
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────
// Purchase Requisitions
// ──────────────────────────────────────────────

export type RequisitionStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Converted';

/** A single line item returned by the API (GET response shape). */
export interface RequisitionLineItem extends Timestamp {
  id: string;
  purchase_requisition: string;
  product: string;
  product_name: string;
  quantity: number | string;
  unit_of_measure: string;
  description: string;
}

/** Full purchase requisition returned by the API (GET response shape). */
export interface PurchaseRequisition extends Timestamp {
  id: string;
  pr_number: string;
  requested_by: string;
  requested_by_name: string;
  warehouse: string;
  warehouse_name: string;
  title: string;
  description: string;
  status: RequisitionStatus;

  submitted_by: string | null;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  converted_at: string | null;

  line_items: RequisitionLineItem[];
}

// ──────────────────────────────────────────────
// DTOs – POST / PUT / PATCH payloads
// ──────────────────────────────────────────────

/** A single line item in the POST/PUT request body. */
export interface CreateRequisitionLineDTO {
  product_id: string;
  quantity: string;
  unit_of_measure: string;
  description?: string;
}

/** POST body for creating a new requisition. */
export interface CreateRequisitionDTO {
  warehouse_id: string;
  title: string;
  description?: string;
  lines: CreateRequisitionLineDTO[];
}

/** PUT / PATCH body – partial updates. */
export type UpdateRequisitionDTO = Partial<CreateRequisitionDTO>;

// ──────────────────────────────────────────────
// Status-Action DTOs
// ──────────────────────────────────────────────

export interface SubmitRequisitionDTO {
  submitted_by: string;
}

export interface ApproveRequisitionDTO {
  approved_by: string;
}

export interface RejectRequisitionDTO {
  rejected_by: string;
  reason: string;
}

export interface ConvertLineDTO {
  pr_line_item_id: string;
  unit_price: string;
}

export interface ConvertRequisitionDTO {
  supplier_id: string;
  created_by: string;
  lines: ConvertLineDTO[];
}

// ──────────────────────────────────────────────
// Supplier (minimal — for convert page dropdown)
// ──────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
}
