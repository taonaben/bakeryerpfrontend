import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { reportsService } from '../services/reportsService';
import type {
  DailySummary,
  RevenueByProduct,
  MarginByProduct,
  CustomerStatement,
  OutstandingDebtor,
  SalesByWarehouse,
  DailySummaryParams,
  DateRangeWarehouseParams,
} from '../types/reports_models';

interface ReportsState {
  dailySummary: DailySummary | null;
  revenueByProduct: RevenueByProduct[];
  marginByProduct: MarginByProduct[];
  customerStatement: CustomerStatement | null;
  outstandingDebtors: OutstandingDebtor[];
  salesByWarehouse: SalesByWarehouse[];
  isLoading: boolean;
  error: string | null;

  fetchDailySummary: (params?: DailySummaryParams) => Promise<void>;
  fetchRevenueByProduct: (params?: DateRangeWarehouseParams) => Promise<void>;
  fetchMarginByProduct: (params?: DateRangeWarehouseParams) => Promise<void>;
  fetchCustomerStatement: (customerId: string) => Promise<void>;
  fetchOutstandingDebtors: () => Promise<void>;
  fetchSalesByWarehouse: (params?: DateRangeWarehouseParams) => Promise<void>;
  clearError: () => void;
}

export const useReportsStore = create<ReportsState>()(
  devtools(
    immer((set) => ({
      dailySummary: null,
      revenueByProduct: [],
      marginByProduct: [],
      customerStatement: null,
      outstandingDebtors: [],
      salesByWarehouse: [],
      isLoading: false,
      error: null,

      fetchDailySummary: async (params) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const result = await reportsService.getDailySummary(params);
          set((d) => { d.dailySummary = result; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      fetchRevenueByProduct: async (params) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const result = await reportsService.getRevenueByProduct(params);
          set((d) => { d.revenueByProduct = result; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      fetchMarginByProduct: async (params) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const result = await reportsService.getMarginByProduct(params);
          set((d) => { d.marginByProduct = result; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      fetchCustomerStatement: async (customerId) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const result = await reportsService.getCustomerStatement(customerId);
          set((d) => { d.customerStatement = result; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      fetchOutstandingDebtors: async () => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const result = await reportsService.getOutstandingDebtors();
          set((d) => { d.outstandingDebtors = result; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      fetchSalesByWarehouse: async (params) => {
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const result = await reportsService.getSalesByWarehouse(params);
          set((d) => { d.salesByWarehouse = result; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      clearError: () => set((d) => { d.error = null; }),
    })),
    { name: 'sales-reports-store' },
  ),
);
