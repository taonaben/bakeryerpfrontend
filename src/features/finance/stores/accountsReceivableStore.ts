import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { accountsReceivableService } from '../services/accountsReceivableService';
import type { AccountsReceivable } from '../types/accounts_receivable_models';

interface AccountsReceivableState {
  items: AccountsReceivable[];
  isLoading: boolean;
  error: string | null;

  fetchAll: (params?: { status?: string; customer_id?: string; overdue?: boolean }, force?: boolean) => Promise<void>;
  fetchById: (id: string) => Promise<AccountsReceivable>;
  fetchByCustomer: (customerId: string) => Promise<AccountsReceivable[]>;
  clearError: () => void;
}

export const useAccountsReceivableStore = create<AccountsReceivableState>()(
  devtools(
    immer((set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      fetchAll: async (params, force = false) => {
        if (!force && get().items.length > 0) return;
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const items = await accountsReceivableService.fetchAll(params);
          set((state) => { state.items = items; state.isLoading = false; });
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
        }
      },

      fetchById: async (id) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const item = await accountsReceivableService.fetchById(id);
          set((state) => { state.isLoading = false; });
          return item;
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
          throw e;
        }
      },

      fetchByCustomer: async (customerId) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const items = await accountsReceivableService.fetchByCustomer(customerId);
          set((state) => { state.isLoading = false; });
          return items;
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
          throw e;
        }
      },

      clearError: () => set((state) => { state.error = null; }),
    })),
    { name: 'accounts-receivable-store' }
  )
);
