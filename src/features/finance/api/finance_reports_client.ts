import apiClient from '@/shared/services/api';
import type {
  TrialBalanceReport,
  IncomeStatementReport,
  BalanceSheetReport,
  ARAgingReport,
  APAgingReport,
} from '../types/finance_reports_models';

const BASE = '/finance/reports';

export const financeReportsApi = {
  getTrialBalance: async (params?: { date_from?: string; date_to?: string; fiscal_period_id?: string }): Promise<TrialBalanceReport> => {
    const { data } = await apiClient.get(`${BASE}/trial-balance`, { params });
    return data;
  },

  getIncomeStatement: async (params?: { date_from?: string; date_to?: string }): Promise<IncomeStatementReport> => {
    const { data } = await apiClient.get(`${BASE}/income-statement`, { params });
    return data;
  },

  getBalanceSheet: async (params?: { as_of_date?: string }): Promise<BalanceSheetReport> => {
    const { data } = await apiClient.get(`${BASE}/balance-sheet`, { params });
    return data;
  },

  getARAging: async (): Promise<ARAgingReport> => {
    const { data } = await apiClient.get(`${BASE}/ar-aging`);
    return data;
  },

  getAPAging: async (): Promise<APAgingReport> => {
    const { data } = await apiClient.get(`${BASE}/ap-aging`);
    return data;
  },
};
