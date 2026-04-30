import { reportsApi } from '../api/reports_client';
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

// ──────────────────────────────────────────────
// Sales Reports Service
// ──────────────────────────────────────────────

export const reportsService = {
  async getDailySummary(params?: DailySummaryParams): Promise<DailySummary> {
    return reportsApi.getDailySummary(params);
  },

  async getRevenueByProduct(
    params?: DateRangeWarehouseParams,
  ): Promise<RevenueByProduct[]> {
    return reportsApi.getRevenueByProduct(params);
  },

  async getMarginByProduct(
    params?: DateRangeWarehouseParams,
  ): Promise<MarginByProduct[]> {
    return reportsApi.getMarginByProduct(params);
  },

  async getCustomerStatement(customerId: string): Promise<CustomerStatement> {
    if (!customerId) throw new Error('Customer ID is required');
    return reportsApi.getCustomerStatement(customerId);
  },

  async getOutstandingDebtors(): Promise<OutstandingDebtor[]> {
    return reportsApi.getOutstandingDebtors();
  },

  async getSalesByWarehouse(
    params?: DateRangeWarehouseParams,
  ): Promise<SalesByWarehouse[]> {
    return reportsApi.getSalesByWarehouse(params);
  },
};
