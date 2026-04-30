import type { PaymentMethod } from './shared';

// ──────────────────────────────────────────────
// Payments
// ──────────────────────────────────────────────

export interface Payment {
  id: string;
  invoice: string;
  invoice_number: string;
  customer: string;
  customer_name: string;
  amount: string;
  payment_method: PaymentMethod;
  payment_date: string;
  reference: string;
  received_by: string;
  notes: string;
}

export interface RecordPaymentDTO {
  amount: string;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  allow_overpayment?: boolean;
}

export interface PaymentFilters {
  customer_id?: string;
  payment_method?: PaymentMethod;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}
