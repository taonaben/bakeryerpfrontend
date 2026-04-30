// ──────────────────────────────────────────────
// Sales – Shared primitives
// ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'cheque';
export type CustomerType = 'retail' | 'business';
export type OrderType = 'pos' | 'b2b';
export type OrderStatus = 'draft' | 'confirmed' | 'cancelled';
export type DeliveryStatus = 'dispatched' | 'delivered' | 'failed';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'partial' | 'overdue' | 'cancelled';
export type PriceSource = 'agreement' | 'pricing_rule';
