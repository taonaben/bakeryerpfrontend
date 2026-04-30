import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ordersService } from '../services/ordersService';
import type {
  SalesOrder,
  SalesOrderDetail,
  CreateSalesOrderDTO,
  UpdateSalesOrderDTO,
  AddOrderLineDTO,
  UpdateOrderLineDTO,
  OrderLine,
  CancelOrderDTO,
  POSSaleDTO,
  ResolvedPrice,
  ResolvePriceParams,
  OrderFilters,
} from '../types/orders_models';
import type { Delivery } from '../types/deliveries_models';
import type { InvoiceDetail } from '../types/invoices_models';

const CACHE_TTL_MS = 5 * 60 * 1000;
const isStale = (ts: number | null) => !ts || Date.now() - ts > CACHE_TTL_MS;

interface OrdersState {
  // Data
  items: SalesOrder[];
  detailMap: Record<string, SalesOrderDetail>;
  deliveriesMap: Record<string, Delivery[]>;
  invoiceMap: Record<string, InvoiceDetail>;
  resolvedPrice: ResolvedPrice | null;

  // Loading & Error
  isLoading: boolean;
  isSubmitting: boolean;
  isResolvingPrice: boolean;
  error: string | null;
  lastFetched: number | null;
  isFetching: boolean;

  // Actions
  fetchAll: (filters?: OrderFilters, force?: boolean) => Promise<void>;
  fetchById: (id: string, force?: boolean) => Promise<void>;
  create: (dto: CreateSalesOrderDTO) => Promise<SalesOrderDetail>;
  patch: (id: string, dto: UpdateSalesOrderDTO) => Promise<SalesOrderDetail>;
  addLine: (id: string, dto: AddOrderLineDTO) => Promise<OrderLine>;
  updateLine: (id: string, lineId: string, dto: UpdateOrderLineDTO) => Promise<OrderLine>;
  removeLine: (id: string, lineId: string) => Promise<void>;
  confirm: (id: string) => Promise<SalesOrderDetail>;
  cancel: (id: string, dto?: CancelOrderDTO) => Promise<SalesOrderDetail>;
  fetchDeliveries: (id: string) => Promise<void>;
  dispatch: (orderId: string) => Promise<Delivery>;
  fetchInvoice: (orderId: string) => Promise<void>;
  generateInvoice: (orderId: string) => Promise<InvoiceDetail>;
  posSale: (dto: POSSaleDTO) => Promise<SalesOrderDetail>;
  resolvePrice: (params: ResolvePriceParams) => Promise<ResolvedPrice>;
  clearResolvedPrice: () => void;
  clearError: () => void;
}

export const useOrdersStore = create<OrdersState>()(
  devtools(
    immer((set, get) => ({
      items: [],
      detailMap: {},
      deliveriesMap: {},
      invoiceMap: {},
      resolvedPrice: null,
      isLoading: false,
      isSubmitting: false,
      isResolvingPrice: false,
      error: null,
      lastFetched: null,
      isFetching: false,

      fetchAll: async (filters, force = false) => {
        const state = get();
        if (!force && !isStale(state.lastFetched) && state.items.length > 0) return;
        if (state.isFetching) return;
        set((d) => { d.isFetching = true; d.isLoading = true; d.error = null; });
        try {
          const items = await ordersService.fetchAll(filters);
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
          const detail = await ordersService.fetchById(id);
          set((d) => { d.detailMap[id] = detail; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      create: async (dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const created = await ordersService.create(dto);
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
          const updated = await ordersService.patch(id, dto);
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

      addLine: async (id, dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const line = await ordersService.addLine(id, dto);
          set((d) => {
            const order = d.detailMap[id];
            if (order) {
              order.lines = [...order.lines, line];
            }
            d.isSubmitting = false;
          });
          return line;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      updateLine: async (id, lineId, dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const updated = await ordersService.updateLine(id, lineId, dto);
          set((d) => {
            const order = d.detailMap[id];
            if (order) {
              order.lines = order.lines.map((l) => (l.id === lineId ? updated : l));
            }
            d.isSubmitting = false;
          });
          return updated;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      removeLine: async (id, lineId) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          await ordersService.removeLine(id, lineId);
          set((d) => {
            const order = d.detailMap[id];
            if (order) {
              order.lines = order.lines.filter((l) => l.id !== lineId);
            }
            d.isSubmitting = false;
          });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      confirm: async (id) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const updated = await ordersService.confirm(id);
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

      cancel: async (id, dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const updated = await ordersService.cancel(id, dto);
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

      fetchDeliveries: async (id) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const deliveries = await ordersService.fetchDeliveries(id);
          set((d) => { d.deliveriesMap[id] = deliveries; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      dispatch: async (orderId) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const delivery = await ordersService.dispatch(orderId);
          set((d) => {
            const existing = d.deliveriesMap[orderId] ?? [];
            d.deliveriesMap[orderId] = [delivery, ...existing];
            d.isSubmitting = false;
          });
          return delivery;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      fetchInvoice: async (orderId) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const invoice = await ordersService.fetchInvoice(orderId);
          set((d) => { d.invoiceMap[orderId] = invoice; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      generateInvoice: async (orderId) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const invoice = await ordersService.generateInvoice(orderId);
          set((d) => {
            d.invoiceMap[orderId] = invoice;
            d.isSubmitting = false;
          });
          return invoice;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      posSale: async (dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const order = await ordersService.posSale(dto);
          set((d) => {
            d.items = [order, ...d.items];
            d.detailMap[order.id] = order;
            d.isSubmitting = false;
            d.lastFetched = null;
          });
          return order;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      resolvePrice: async (params) => {
        set((d) => { d.isResolvingPrice = true; d.error = null; });
        try {
          const resolved = await ordersService.resolvePrice(params);
          set((d) => { d.resolvedPrice = resolved; d.isResolvingPrice = false; });
          return resolved;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isResolvingPrice = false; });
          throw e;
        }
      },

      clearResolvedPrice: () => set((d) => { d.resolvedPrice = null; }),
      clearError: () => set((d) => { d.error = null; }),
    })),
    { name: 'orders-store' },
  ),
);
