import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { invoicesService } from '../services/invoicesService';
import type {
  Invoice,
  InvoiceDetail,
  CancelInvoiceDTO,
  InvoiceFilters,
} from '../types/invoices_models';
import type { Payment, RecordPaymentDTO } from '../types/payments_models';

const CACHE_TTL_MS = 5 * 60 * 1000;
const isStale = (ts: number | null) => !ts || Date.now() - ts > CACHE_TTL_MS;

interface InvoicesState {
  items: Invoice[];
  detailMap: Record<string, InvoiceDetail>;
  paymentsMap: Record<string, Payment[]>;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastFetched: number | null;
  isFetching: boolean;

  fetchAll: (filters?: InvoiceFilters, force?: boolean) => Promise<void>;
  fetchById: (id: string, force?: boolean) => Promise<void>;
  cancel: (id: string, dto?: CancelInvoiceDTO) => Promise<InvoiceDetail>;
  fetchPayments: (invoiceId: string) => Promise<void>;
  recordPayment: (invoiceId: string, dto: RecordPaymentDTO) => Promise<Payment>;
  clearError: () => void;
}

export const useInvoicesStore = create<InvoicesState>()(
  devtools(
    immer((set, get) => ({
      items: [],
      detailMap: {},
      paymentsMap: {},
      isLoading: false,
      isSubmitting: false,
      error: null,
      lastFetched: null,
      isFetching: false,

      fetchAll: async (filters, force = false) => {
        const state = get();
        if (!force && !isStale(state.lastFetched) && state.items.length > 0) return;
        if (state.isFetching) return;
        set((d) => { d.isFetching = true; d.isLoading = true; d.error = null; });
        try {
          const items = await invoicesService.fetchAll(filters);
          set((d) => {
            d.items = items;
            d.lastFetched = Date.now();
            d.isFetching = false;
            d.isLoading = false;
          });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isFetching = false; d.isLoading = false; });
        }
      },

      fetchById: async (id, force = false) => {
        const state = get();
        if (!force && state.detailMap[id]) return;
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const detail = await invoicesService.fetchById(id);
          set((d) => { d.detailMap[id] = detail; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      cancel: async (id, dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const updated = await invoicesService.cancel(id, dto);
          set((d) => {
            d.detailMap[id] = updated;
            d.items = d.items.map((i) => (i.id === id ? updated : i));
            d.isSubmitting = false;
          });
          return updated;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      fetchPayments: async (invoiceId) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const payments = await invoicesService.fetchPayments(invoiceId);
          set((d) => { d.paymentsMap[invoiceId] = payments; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      recordPayment: async (invoiceId, dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const payment = await invoicesService.recordPayment(invoiceId, dto);
          set((d) => {
            const existing = d.paymentsMap[invoiceId] ?? [];
            d.paymentsMap[invoiceId] = [payment, ...existing];
            d.isSubmitting = false;
          });
          return payment;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      clearError: () => set((d) => { d.error = null; }),
    })),
    { name: 'invoices-store' },
  ),
);
