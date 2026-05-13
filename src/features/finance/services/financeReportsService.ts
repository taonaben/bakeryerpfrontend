import { financeReportsApi } from '../api/finance_reports_client';
import type {
  TrialBalanceReport,
  IncomeStatementReport,
  BalanceSheetReport,
  ARAgingReport,
  APAgingReport,
} from '../types/finance_reports_models';

export const financeReportsService = {
  async getTrialBalance(params?: { date_from?: string; date_to?: string; fiscal_period_id?: string }): Promise<TrialBalanceReport> {
    return financeReportsApi.getTrialBalance(params);
  },

  async getIncomeStatement(params?: { date_from?: string; date_to?: string }): Promise<IncomeStatementReport> {
    return financeReportsApi.getIncomeStatement(params);
  },

  async getBalanceSheet(params?: { as_of_date?: string }): Promise<BalanceSheetReport> {
    return financeReportsApi.getBalanceSheet(params);
  },

  async getARAging(): Promise<ARAgingReport> {
    return financeReportsApi.getARAging();
  },

  async getAPAging(): Promise<APAgingReport> {
    return financeReportsApi.getAPAging();
  },
};
