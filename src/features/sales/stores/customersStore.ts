import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { customersService } from '../services/customersService';
import type {
  Customer,
  CustomerDetail,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  PricingAgreement,
  CreatePricingAgreementDTO,
  UpdatePricingAgreementDTO,
  CustomerOutstanding,
  CustomerFilters,
} from '../types/customers_models';
import type { SalesOrder } from '../types/orders_models';
import type { Invoice } from '../types/invoices_models';
import type { Payment } from '../types/payments_models';

const CACHE_TTL_MS = 5 * 60 * 1000;
const isStale = (ts: number | null) => !ts || Date.now() - ts > CACHE_TTL_MS;

interface CustomersState {
  // Data
  items: Customer[];
  detailMap: Record<string, CustomerDetail>;
  // Per-customer sub-resource caches
  ordersMap: Record<string, SalesOrder[]>;
  invoicesMap: Record<string, Invoice[]>;
  paymentsMap: Record<string, Payment[]>;
  outstandingMap: Record<string, CustomerOutstanding>;
  pricingMap: Record<string, PricingAgreement[]>;

  // Loading & Error
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastFetched: number | null;
  isFetching: boolean;

  // Actions
  fetchAll: (filters?: CustomerFilters, force?: boolean) => Promise<void>;
  fetchById: (id: string, force?: boolean) => Promise<void>;
  create: (dto: CreateCustomerDTO) => Promise<CustomerDetail>;
  patch: (id: string, dto: UpdateCustomerDTO) => Promise<CustomerDetail>;
  deactivate: (id: string) => Promise<void>;
  fetchOrders: (id: string) => Promise<void>;
  fetchInvoices: (id: string) => Promise<void>;
  fetchPayments: (id: string) => Promise<void>;
  fetchOutstanding: (id: string) => Promise<void>;
  fetchPricingAgreements: (id: string) => Promise<void>;
  createPricingAgreement: (
    customerId: string,
    dto: CreatePricingAgreementDTO,
  ) => Promise<PricingAgreement>;
  updatePricingAgreement: (
    customerId: string,
    agreementId: string,
    dto: UpdatePricingAgreementDTO,
  ) => Promise<PricingAgreement>;
  deactivatePricingAgreement: (customerId: string, agreementId: string) => Promise<void>;
  clearError: () => void;
}

export const useCustomersStore = create<CustomersState>()(
  devtools(
    immer((set, get) => ({
      items: [],
      detailMap: {},
      ordersMap: {},
      invoicesMap: {},
      paymentsMap: {},
      outstandingMap: {},
      pricingMap: {},
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
          const items = await customersService.fetchAll(filters);
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
          const detail = await customersService.fetchById(id);
          set((d) => { d.detailMap[id] = detail; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      create: async (dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const created = await customersService.create(dto);
          set((d) => {
            d.items = [created, ...d.items];
            d.detailMap[created.id] = created;
            d.isSubmitting = false;
            d.lastFetched = null;
          });
          return created;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      patch: async (id, dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const updated = await customersService.patch(id, dto);
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

      deactivate: async (id) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          await customersService.deactivate(id);
          set((d) => {
            d.items = d.items.filter((i) => i.id !== id);
            delete d.detailMap[id];
            d.isSubmitting = false;
            d.lastFetched = null;
          });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      fetchOrders: async (id) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const orders = await customersService.fetchOrders(id);
          set((d) => { d.ordersMap[id] = orders; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      fetchInvoices: async (id) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const invoices = await customersService.fetchInvoices(id);
          set((d) => { d.invoicesMap[id] = invoices; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      fetchPayments: async (id) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const payments = await customersService.fetchPayments(id);
          set((d) => { d.paymentsMap[id] = payments; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      fetchOutstanding: async (id) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const outstanding = await customersService.fetchOutstanding(id);
          set((d) => { d.outstandingMap[id] = outstanding; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      fetchPricingAgreements: async (id) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const agreements = await customersService.fetchPricingAgreements(id);
          set((d) => { d.pricingMap[id] = agreements; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      createPricingAgreement: async (customerId, dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const created = await customersService.createPricingAgreement(customerId, dto);
          set((d) => {
            const existing = d.pricingMap[customerId] ?? [];
            d.pricingMap[customerId] = [created, ...existing];
            d.isSubmitting = false;
          });
          return created;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      updatePricingAgreement: async (customerId, agreementId, dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const updated = await customersService.updatePricingAgreement(
            customerId,
            agreementId,
            dto,
          );
          set((d) => {
            const list = d.pricingMap[customerId] ?? [];
            d.pricingMap[customerId] = list.map((a) =>
              a.id === agreementId ? updated : a,
            );
            d.isSubmitting = false;
          });
          return updated;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      deactivatePricingAgreement: async (customerId, agreementId) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          await customersService.deactivatePricingAgreement(customerId, agreementId);
          set((d) => {
            const list = d.pricingMap[customerId] ?? [];
            d.pricingMap[customerId] = list.filter((a) => a.id !== agreementId);
            d.isSubmitting = false;
          });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      clearError: () => set((d) => { d.error = null; }),
    })),
    { name: 'customers-store' },
  ),
);
