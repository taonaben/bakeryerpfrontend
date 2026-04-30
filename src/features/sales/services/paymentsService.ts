import { paymentsApi } from '../api/payments_client';
import type { Payment, PaymentFilters } from '../types/payments_models';

// ──────────────────────────────────────────────
// Payments Service
// ──────────────────────────────────────────────

export const paymentsService = {
  async fetchAll(filters?: PaymentFilters): Promise<Payment[]> {
    const params = buildParams(filters);
    return paymentsApi.getAll(params);
  },
};

// ── Helpers ──────────────────────────────────

function buildParams(filters?: PaymentFilters): Record<string, any> {
  const params: Record<string, any> = {};
  if (!filters) return params;
  if (filters.customer_id) params.customer_id = filters.customer_id;
  if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;
  if (filters.payment_method) params.payment_method = filters.payment_method;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.page) params.page = filters.page;
  if (filters.page_size) params.page_size = filters.page_size;
  return params;
}
