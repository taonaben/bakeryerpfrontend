import type { InvoiceStatus } from './shared';

// ──────────────────────────────────────────────
// Invoices
// ──────────────────────────────────────────────

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  order_number: string;
  customer_name: string;
  issued_date: string;
  due_date: string;
  total_amount: string;
  status: InvoiceStatus;
  created_at: string;
}

export interface InvoiceLine {
  product_id: string;
  product_name: string;
  quantity_dispatched: string;
  unit_price: string;
  line_total: string;
}

export interface InvoiceDetail extends Invoice {
  sales_order: string;
  subtotal: string;
  tax_amount: string;
  lines: InvoiceLine[];
}

export interface CancelInvoiceDTO {
  reason?: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  overdue?: boolean;
  page?: number;
  page_size?: number;
}

export interface InvoicePDFResponse {
  detail: string;
  invoice: InvoiceDetail;
}
