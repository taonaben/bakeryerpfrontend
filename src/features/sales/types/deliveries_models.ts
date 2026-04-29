import type { DeliveryStatus } from './shared';

// ──────────────────────────────────────────────
// Deliveries
// ──────────────────────────────────────────────

export interface Delivery {
  id: string;
  delivery_number: string;
  sales_order: string;
  order_number: string;
  warehouse: string;
  warehouse_name: string;
  status: DeliveryStatus;
  dispatched_at: string;
  delivered_at: string | null;
}

export interface DeliveryLine {
  id: string;
  product: string;
  product_name: string;
  batch: string;
  batch_number: string;
  quantity_delivered: string;
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
