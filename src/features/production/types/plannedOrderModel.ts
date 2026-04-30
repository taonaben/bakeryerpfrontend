// ──────────────────────────────────────────────
// Planned Production Orders – Data Models
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
// Planned Production Orders
// ──────────────────────────────────────────────

export type PlannedOrderStatus = 'draft' | 'scheduled' | 'in_production' | 'completed';
export type PlannedOrderPriority = 'low' | 'medium' | 'high';

/** Planned production order returned by the API (GET response shape). */
export interface PlannedOrder extends Timestamp {
  id: string;
  product: string;
  product_name: string;
  quantity: string | number;
  warehouse: string;
  warehouse_name: string;
  need_by: string; // ISO datetime
  priority: PlannedOrderPriority;
  status: PlannedOrderStatus;
  production_order_id: string;
  production_order_status: string;
  planning: string;
  queue_position: string | number;
  can_request_priority_override: boolean;
  // Priority override fields
  priority_override_requested_at: string | null;
  priority_override_approved_at: string | null;
  priority_override_approved_by: string | null;
  priority_override_note: string | null;
}

// ──────────────────────────────────────────────
// DTOs – POST / PUT / PATCH payloads
// ──────────────────────────────────────────────

/** POST body for creating a new planned order. */
export interface CreatePlannedOrderDTO {
  product: string;
  quantity: string | number;
  warehouse: string;
  need_by: string;
  priority: PlannedOrderPriority;
  status?: PlannedOrderStatus;
}

/** PUT / PATCH body – partial updates. */
export type UpdatePlannedOrderDTO = Partial<CreatePlannedOrderDTO>;

// ──────────────────────────────────────────────
// Priority Override DTO
// ──────────────────────────────────────────────

export interface RequestPriorityOverrideDTO {
  priority: PlannedOrderPriority;
  priority_override_note?: string;
}

export interface ApprovePriorityOverrideDTO {
  approved_by: string;
}

export interface RejectPriorityOverrideDTO {
  rejected_by: string;
  rejection_reason: string;
}

// ──────────────────────────────────────────────
// Bulk Action DTOs
// ──────────────────────────────────────────────

export interface BulkUpdatePriorityDTO {
  order_ids: string[];
  priority: PlannedOrderPriority;
  priority_override_note?: string;
}

export interface BulkUpdateWarehouseDTO {
  order_ids: string[];
  warehouse: string;
}

export interface BulkDeleteDTO {
  order_ids: string[];
}
