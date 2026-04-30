import { invoicesApi } from '../api/invoices_client';
import type {
  Invoice,
  InvoiceDetail,
  CancelInvoiceDTO,
  InvoicePDFResponse,
  InvoiceFilters,
} from '../types/invoices_models';
import type { Payment, RecordPaymentDTO } from '../types/payments_models';

// ──────────────────────────────────────────────
// Invoices Service
// ──────────────────────────────────────────────

export const invoicesService = {
  async fetchAll(filters?: InvoiceFilters): Promise<Invoice[]> {
    const params = buildParams(filters);
    return invoicesApi.getAll(params);
  },

  async fetchById(id: string): Promise<InvoiceDetail> {
    if (!id) throw new Error('Invoice ID is required');
    return invoicesApi.getById(id);
  },

  async cancel(id: string, dto?: CancelInvoiceDTO): Promise<InvoiceDetail> {
    if (!id) throw new Error('Invoice ID is required');
    return invoicesApi.cancel(id, dto);
  },

  async getPDF(id: string): Promise<InvoicePDFResponse> {
    if (!id) throw new Error('Invoice ID is required');
    return invoicesApi.getPDF(id);
  },

  async fetchPayments(invoiceId: string): Promise<Payment[]> {
    if (!invoiceId) throw new Error('Invoice ID is required');
    return invoicesApi.getPayments(invoiceId);
  },

  async recordPayment(invoiceId: string, dto: RecordPaymentDTO): Promise<Payment> {
    if (!invoiceId) throw new Error('Invoice ID is required');
    if (!dto.amount || parseFloat(dto.amount) <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }
    if (!dto.payment_method) throw new Error('Payment method is required');
    return invoicesApi.recordPayment(invoiceId, dto);
  },
};

// ── Helpers ──────────────────────────────────

function buildParams(filters?: InvoiceFilters): Record<string, any> {
  const params: Record<string, any> = {};
  if (!filters) return params;
  if (filters.status) params.status = filters.status;
  if (filters.customer_id) params.customer_id = filters.customer_id;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.overdue !== undefined) params.overdue = filters.overdue;
  if (filters.page) params.page = filters.page;
  if (filters.page_size) params.page_size = filters.page_size;
  return params;
}
