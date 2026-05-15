import apiClient from '@/shared/services/api';
import type { JournalEntry, CreateJournalEntryDTO, ReverseJournalEntryDTO } from '../types/journal_entries_models';

const BASE = '/finance/journal-entries';

export const journalEntriesApi = {
  getAll: async (params?: { date_from?: string; date_to?: string; entry_type?: string; reference_type?: string; fiscal_period_id?: string }): Promise<JournalEntry[]> => {
    const { data } = await apiClient.get(BASE, { params });
    return Array.isArray(data) ? data : (data?.items ?? []);
  },

  getById: async (id: string): Promise<JournalEntry> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  create: async (dto: CreateJournalEntryDTO): Promise<JournalEntry> => {
    const { data } = await apiClient.post(BASE, dto);
    return data;
  },

  reverse: async (id: string, dto?: ReverseJournalEntryDTO): Promise<JournalEntry> => {
    const { data } = await apiClient.post(`${BASE}/${id}/reverse`, dto ?? {});
    return data;
  },
};
