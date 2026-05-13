import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { chartOfAccountsService } from '../services/chartOfAccountsService';
import type { ChartOfAccount, CreateChartOfAccountDTO, UpdateChartOfAccountDTO } from '../types/chart_of_accounts_models';

interface ChartOfAccountsState {
  items: ChartOfAccount[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchAll: (params?: { account_type?: string; account_subtype?: string; is_active?: boolean }, force?: boolean) => Promise<void>;
  fetchById: (id: string) => Promise<ChartOfAccount>;
  create: (dto: CreateChartOfAccountDTO) => Promise<ChartOfAccount>;
  update: (id: string, dto: UpdateChartOfAccountDTO) => Promise<ChartOfAccount>;
  delete: (id: string) => Promise<void>;
  seed: () => Promise<void>;
  clearError: () => void;
}

export const useChartOfAccountsStore = create<ChartOfAccountsState>()(
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
          const items = await chartOfAccountsService.fetchAll(params);
          set((state) => { state.items = items; state.isLoading = false; });
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
        }
      },

      fetchById: async (id) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const item = await chartOfAccountsService.fetchById(id);
          set((state) => { state.isLoading = false; });
          return item;
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
          throw e;
        }
      },

      create: async (dto) => {
        set((state) => { state.isSubmitting = true; state.error = null; });
        try {
          const newItem = await chartOfAccountsService.create(dto);
          set((state) => {
            state.items.push(newItem);
            state.isSubmitting = false;
          });
          return newItem;
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isSubmitting = false; });
          throw e;
        }
      },

      update: async (id, dto) => {
        set((state) => { state.isSubmitting = true; state.error = null; });
        try {
          const updatedItem = await chartOfAccountsService.update(id, dto);
          set((state) => {
            const index = state.items.findIndex(i => i.id === id);
            if (index !== -1) {
              state.items[index] = updatedItem;
            }
            state.isSubmitting = false;
          });
          return updatedItem;
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isSubmitting = false; });
          throw e;
        }
      },

      delete: async (id) => {
        set((state) => { state.isSubmitting = true; state.error = null; });
        try {
          await chartOfAccountsService.delete(id);
          set((state) => {
            state.items = state.items.filter(i => i.id !== id);
            state.isSubmitting = false;
          });
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isSubmitting = false; });
          throw e;
        }
      },

      seed: async () => {
        set((state) => { state.isSubmitting = true; state.error = null; });
        try {
          await chartOfAccountsService.seed();
          // After seeding, refetch all
          const items = await chartOfAccountsService.fetchAll();
          set((state) => { state.items = items; state.isSubmitting = false; });
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isSubmitting = false; });
          throw e;
        }
      },

      clearError: () => set((state) => { state.error = null; }),
    })),
    { name: 'chart-of-accounts-store' }
  )
);
