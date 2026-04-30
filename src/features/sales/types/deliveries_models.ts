import type { DeliveryStatus } from './shared';

// ──────────────────────────────────────────────
// Deliveries
// ──────────────────────────────────────────────

export interface Delivery {
  id: string;
  delivery_number: string;
  sales_order: string;
  order_number: string;
  customer_name?: string;
  warehouse: string;
  warehouse_name: string;
  status: DeliveryStatus;
  dispatched_at: string;
  expected_delivery_date?: string | null;
  delivered_at: string | null;
  failed_reason?: string;
  failure_reason?: string;
  reason?: string;
}

export interface DeliveryLine {
  id: string;
  product: string;
  product_name: string;
  batch: string;
  batch_number: string;
  quantity_delivered: string;
  stock_movement?: string;
  stock_movement_id?: string;
  stock_movement_reference?: string;
  movement?: string;
  movement_id?: string;
  movement_reference?: string;
}

export interface DeliveryDetail extends Delivery {
  driver_name: string;
  vehicle: string;
  notes: string;
  lines: DeliveryLine[];
}

export interface ConfirmDeliveryDTO {
  notes?: string;
}

export interface FailDeliveryDTO {
  reason: string;
}

export interface DeliveryFilters {
  status?: DeliveryStatus;
  warehouse_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}
