import type { OrderType, OrderStatus } from './shared';

// ──────────────────────────────────────────────
// Sales Orders
// ──────────────────────────────────────────────

export interface OrderLine {
  id: string;
  product: string;
  product_name: string;
  quantity: string;
  unit_price: string;
  subtotal: string;
  quantity_dispatched: string;
  cost_per_unit: string;
  cogs_total: string;
  warning?: string;
}

export interface SalesOrder {
  id: string;
  order_number: string;
  customer: string;
  customer_name: string;
  warehouse: string;
  warehouse_name: string;
  order_type: OrderType;
  status: OrderStatus;
  order_date: string;
  total_amount: string;
  created_at: string;
}

export interface SalesOrderDetail extends SalesOrder {
  expected_delivery_date: string | null;
  delivery_address: string;
  notes: string;
  subtotal: string;
  tax_amount: string;
  updated_at: string;
  created_by: string;
  lines: OrderLine[];
}

export interface CreateSalesOrderDTO {
  customer_id: string;
  warehouse_id: string;
  expected_delivery_date?: string;
  delivery_address?: string;
  notes?: string;
}

export interface UpdateSalesOrderDTO {
  notes?: string;
  delivery_address?: string;
  expected_delivery_date?: string;
}

export interface AddOrderLineDTO {
  product_id: string;
  quantity: string;
}

export interface UpdateOrderLineDTO {
  quantity: string;
}

export interface CancelOrderDTO {
  reason?: string;
}

export interface POSSaleDTO {
  customer_id?: string;
  warehouse_id: string;
  lines: Array<{ product_id: string; quantity: string }>;
  payment_method?: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque';
}

export interface OrderFilters {
  order_type?: OrderType;
  status?: OrderStatus;
  warehouse_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

// ── Price Resolution ──────────────────────────

export interface ResolvedPrice {
  product_id: string;
  product_name: string;
  customer_id: string;
  order_type: OrderType;
  resolved_price: string;
  price_source: 'agreement' | 'pricing_rule';
  minimum_selling_price: string | null;
  recommended_selling_price: string | null;
  below_floor: boolean;
  stock_available: string;
  sufficient_stock: boolean;
}

export interface ResolvePriceParams {
  customer_id: string;
  product_id: string;
  warehouse_id: string;
}
