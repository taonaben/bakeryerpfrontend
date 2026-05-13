import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { journalEntriesService } from '../services/journalEntriesService';
import type { JournalEntry, CreateJournalEntryDTO, ReverseJournalEntryDTO } from '../types/journal_entries_models';

interface JournalEntriesState {
  items: JournalEntry[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchAll: (params?: { date_from?: string; date_to?: string; entry_type?: string; reference_type?: string; fiscal_period_id?: string }, force?: boolean) => Promise<void>;
  fetchById: (id: string) => Promise<JournalEntry>;
  create: (dto: CreateJournalEntryDTO) => Promise<JournalEntry>;
  reverse: (id: string, dto?: ReverseJournalEntryDTO) => Promise<JournalEntry>;
  clearError: () => void;
}

export const useJournalEntriesStore = create<JournalEntriesState>()(
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
          const items = await journalEntriesService.fetchAll(params);
          set((state) => { state.items = items; state.isLoading = false; });
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isLoading = false; });
        }
      },

      fetchById: async (id) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const item = await journalEntriesService.fetchById(id);
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
          const newItem = await journalEntriesService.create(dto);
          set((state) => {
            state.items.unshift(newItem); // put new entries at the top
            state.isSubmitting = false;
          });
          return newItem;
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isSubmitting = false; });
          throw e;
        }
      },

      reverse: async (id, dto) => {
        set((state) => { state.isSubmitting = true; state.error = null; });
        try {
          const newReversalItem = await journalEntriesService.reverse(id, dto);
          set((state) => {
            state.items.unshift(newReversalItem);
            // Also update the original entry to show as reversed if it exists in list
            const originalIndex = state.items.findIndex(i => i.id === id);
            if (originalIndex !== -1) {
              state.items[originalIndex].is_reversed = true;
            }
            state.isSubmitting = false;
          });
          return newReversalItem;
        } catch (e: any) {
          set((state) => { state.error = e.message; state.isSubmitting = false; });
          throw e;
        }
      },

      clearError: () => set((state) => { state.error = null; }),
    })),
    { name: 'journal-entries-store' }
  )
);
