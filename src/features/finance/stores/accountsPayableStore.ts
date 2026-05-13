import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { accountsPayableService } from '../services/accountsPayableService';
import type { AccountsPayable, PayAPDTO, APPayment } from '../types/accounts_payable_models';

interface AccountsPayableState {
  items: AccountsPayable[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchAll: (params?: { status?: string; supplier_id?: string; overdue?: boolean }, force?: boolean) => Promise<void>;
  fetchById: (id: string) => Promise<AccountsPayable>;
  fetchBySupplier: (supplierId: string) => Promise<AccountsPayable[]>;
  pay: (id: string, dto: PayAPDTO) => Promise<APPayment>;
  clearError: () => void;
}

export const useAccountsPayableStore = create<AccountsPayableState>()(
  devtools(
    immer((set, get) => ({
      items: [],
      isLoading: false,
      isSubmitting: false,
      error: null,

      fetchAll: async (params, force = false) => {
        if (!force && get().items.length > 0) return;
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const items = await accountsPayableService.fetchAll(params);
          set((state) => { state.items = items; state.isLoading = false; });
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
        }
      },

      fetchById: async (id) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const item = await accountsPayableService.fetchById(id);
          set((state) => { state.isLoading = false; });
          return item;
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
          throw e;
        }
      },

      fetchBySupplier: async (supplierId) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const items = await accountsPayableService.fetchBySupplier(supplierId);
          set((state) => { state.isLoading = false; });
          return items;
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
          throw e;
        }
      },

      pay: async (id, dto) => {
        set((state) => { state.isSubmitting = true; state.error = null; });
        try {
          const payment = await accountsPayableService.pay(id, dto);
          // Refetch the AP record to get updated balances
          const updatedItem = await accountsPayableService.fetchById(id);
          set((state) => {
            const index = state.items.findIndex(i => i.id === id);
            if (index !== -1) {
              state.items[index] = updatedItem;
            }
            state.isSubmitting = false;
          });
          return payment;
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isSubmitting = false; });
          throw e;
        }
      },

      clearError: () => set((state) => { state.error = null; }),
    })),
    { name: 'accounts-payable-store' }
  )
);
