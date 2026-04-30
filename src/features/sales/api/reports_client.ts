import apiClient from '@/shared/services/api';
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

const BASE = '/sales/reports';

export const reportsApi = {
  getDailySummary: async (params?: DailySummaryParams): Promise<DailySummary> => {
    const { data } = await apiClient.get(`${BASE}/daily-summary`, { params });
    return data;
  },

  getRevenueByProduct: async (
    params?: DateRangeWarehouseParams,
  ): Promise<RevenueByProduct[]> => {
    const { data } = await apiClient.get(`${BASE}/revenue-by-product`, { params });
    return data;
  },

  getMarginByProduct: async (
    params?: DateRangeWarehouseParams,
  ): Promise<MarginByProduct[]> => {
    const { data } = await apiClient.get(`${BASE}/margin-by-product`, { params });
    return data;
  },

  getCustomerStatement: async (customerId: string): Promise<CustomerStatement> => {
    const { data } = await apiClient.get(`${BASE}/customer-statement/${customerId}`);
    return data;
  },

  getOutstandingDebtors: async (): Promise<OutstandingDebtor[]> => {
    const { data } = await apiClient.get(`${BASE}/outstanding-debtors`);
    return data;
  },

  getSalesByWarehouse: async (
    params?: DateRangeWarehouseParams,
  ): Promise<SalesByWarehouse[]> => {
    const { data } = await apiClient.get(`${BASE}/sales-by-warehouse`, { params });
    return data;
  },
};
