import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { SupplierInvoiceListFilters, SupplierInvoiceStatus } from '../types/supplier_invoices_model';

interface SupplierInvoiceFiltersState {
  filters: SupplierInvoiceListFilters;
  setFilter: (key: keyof SupplierInvoiceListFilters, value: any) => void;
  setFilters: (partial: Partial<SupplierInvoiceListFilters>) => void;
  clearAllFilters: () => void;
  getApiQueryParams: () => Record<string, any>;
  activeFilterCount: () => number;
}

const DEFAULT_FILTERS: SupplierInvoiceListFilters = {
  search: '',
  status: '',
  supplier_id: '',
  purchase_order_id: '',
  warehouse_id: '',
  invoice_date_after: '',
  invoice_date_before: '',
  due_date_after: '',
  due_date_before: '',
  ordering: '-created_at',
  page: 1,
  page_size: 25,
};

const useSupplierInvoiceFilters = create<SupplierInvoiceFiltersState>()(
  devtools(
    immer((set, get) => ({
      filters: { ...DEFAULT_FILTERS },

      setFilter: (key, value) => {
        set((state) => {
          (state.filters as any)[key] = value;
          if (key !== 'page') {
            state.filters.page = 1;
          }
        });
      },

      setFilters: (partial) => {
        set((state) => {
          Object.assign(state.filters, partial);
          const changedNonPageFilter = Object.keys(partial).some((key) => key !== 'page');
          if (changedNonPageFilter) {
            state.filters.page = 1;
          }
        });
      },

      clearAllFilters: () => {
        set((state) => {
          state.filters = { ...DEFAULT_FILTERS };
        });
      },

      getApiQueryParams: () => {
        const { filters } = get();
        const params: Record<string, any> = {};

        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status as SupplierInvoiceStatus;
        if (filters.supplier_id) params.supplier_id = filters.supplier_id;
        if (filters.purchase_order_id) params.purchase_order_id = filters.purchase_order_id;
        if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;

        if (filters.invoice_date_after && filters.invoice_date_before) {
          params.invoice_date__range = `${filters.invoice_date_after},${filters.invoice_date_before}`;
        } else if (filters.invoice_date_after) {
          params.invoice_date__gte = filters.invoice_date_after;
        } else if (filters.invoice_date_before) {
          params.invoice_date__lte = filters.invoice_date_before;
        }

        if (filters.due_date_after && filters.due_date_before) {
          params.due_date__range = `${filters.due_date_after},${filters.due_date_before}`;
        } else if (filters.due_date_after) {
          params.due_date__gte = filters.due_date_after;
        } else if (filters.due_date_before) {
          params.due_date__lte = filters.due_date_before;
        }

        if (filters.ordering) params.ordering = filters.ordering;

        params.page = filters.page;
        params.page_size = filters.page_size;

        return params;
      },

      activeFilterCount: () => {
        const { filters } = get();
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.supplier_id) count++;
        if (filters.purchase_order_id) count++;
        if (filters.warehouse_id) count++;
        if (filters.invoice_date_after || filters.invoice_date_before) count++;
        if (filters.due_date_after || filters.due_date_before) count++;
        if (filters.ordering && filters.ordering !== '-created_at') count++;
        return count;
      },
    })),
    { name: 'supplier-invoice-filters' },
  ),
);

export default useSupplierInvoiceFilters;
