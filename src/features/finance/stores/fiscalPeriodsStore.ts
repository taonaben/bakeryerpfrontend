import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { fiscalPeriodsService } from '../services/fiscalPeriodsService';
import type { FiscalPeriod, CreateFiscalPeriodDTO } from '../types/fiscal_periods_models';

const getErrorMessage = (error: any): string => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data?.errors) return typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
  return error?.message || 'Fiscal period request failed';
};

interface FiscalPeriodsState {
  items: FiscalPeriod[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchAll: (params?: { status?: string }, force?: boolean) => Promise<void>;
  fetchById: (id: string) => Promise<FiscalPeriod>;
  create: (dto: CreateFiscalPeriodDTO) => Promise<FiscalPeriod>;
  close: (id: string) => Promise<FiscalPeriod>;
  clearError: () => void;
}

export const useFiscalPeriodsStore = create<FiscalPeriodsState>()(
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
          const items = await fiscalPeriodsService.fetchAll(params);
          set((state) => { state.items = items; state.isLoading = false; });
        } catch (e: any) {
          set((state) => { state.error = getErrorMessage(e); state.isLoading = false; });
        }
      },

      fetchById: async (id) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const item = await fiscalPeriodsService.fetchById(id);
          set((state) => { state.isLoading = false; });
          return item;
        } catch (e: any) {
          set((state) => { state.error = getErrorMessage(e); state.isLoading = false; });
          throw e;
        }
      },

      create: async (dto) => {
        set((state) => { state.isSubmitting = true; state.error = null; });
        try {
          const newItem = await fiscalPeriodsService.create(dto);
          set((state) => {
            state.items.push(newItem);
            state.isSubmitting = false;
          });
          return newItem;
        } catch (e: any) {
          set((state) => { state.error = getErrorMessage(e); state.isSubmitting = false; });
          throw e;
        }
      },

      close: async (id) => {
        set((state) => { state.isSubmitting = true; state.error = null; });
        try {
          const updatedItem = await fiscalPeriodsService.close(id);
          set((state) => {
            const index = state.items.findIndex(i => i.id === id);
            if (index !== -1) {
              state.items[index] = updatedItem;
            }
            state.isSubmitting = false;
          });
          return updatedItem;
        } catch (e: any) {
          set((state) => { state.error = getErrorMessage(e); state.isSubmitting = false; });
          throw e;
        }
      },

      clearError: () => set((state) => { state.error = null; }),
    })),
    { name: 'fiscal-periods-store' }
  )
);
