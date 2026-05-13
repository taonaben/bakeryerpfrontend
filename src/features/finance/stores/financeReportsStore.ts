import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { financeReportsService } from '../services/financeReportsService';
import type {
  TrialBalanceReport,
  IncomeStatementReport,
  BalanceSheetReport,
  ARAgingReport,
  APAgingReport,
} from '../types/finance_reports_models';

interface FinanceReportsState {
  trialBalance: TrialBalanceReport | null;
  incomeStatement: IncomeStatementReport | null;
  balanceSheet: BalanceSheetReport | null;
  arAging: ARAgingReport | null;
  apAging: APAgingReport | null;
  
  isLoading: boolean;
  error: string | null;

  fetchTrialBalance: (params?: { date_from?: string; date_to?: string; fiscal_period_id?: string }) => Promise<void>;
  fetchIncomeStatement: (params?: { date_from?: string; date_to?: string }) => Promise<void>;
  fetchBalanceSheet: (params?: { as_of_date?: string }) => Promise<void>;
  fetchARAging: () => Promise<void>;
  fetchAPAging: () => Promise<void>;
  clearError: () => void;
}

export const useFinanceReportsStore = create<FinanceReportsState>()(
  devtools(
    immer((set) => ({
      trialBalance: null,
      incomeStatement: null,
      balanceSheet: null,
      arAging: null,
      apAging: null,
      
      isLoading: false,
      error: null,

      fetchTrialBalance: async (params) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const report = await financeReportsService.getTrialBalance(params);
          set((state) => { state.trialBalance = report; state.isLoading = false; });
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
        }
      },

      fetchIncomeStatement: async (params) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const report = await financeReportsService.getIncomeStatement(params);
          set((state) => { state.incomeStatement = report; state.isLoading = false; });
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
        }
      },

      fetchBalanceSheet: async (params) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const report = await financeReportsService.getBalanceSheet(params);
          set((state) => { state.balanceSheet = report; state.isLoading = false; });
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
        }
      },

      fetchARAging: async () => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const report = await financeReportsService.getARAging();
          set((state) => { state.arAging = report; state.isLoading = false; });
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
        }
      },

      fetchAPAging: async () => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const report = await financeReportsService.getAPAging();
          set((state) => { state.apAging = report; state.isLoading = false; });
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
        }
      },

      clearError: () => set((state) => { state.error = null; }),
    })),
    { name: 'finance-reports-store' }
  )
);
