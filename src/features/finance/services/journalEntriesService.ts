import { journalEntriesApi } from '../api/journal_entries_client';
import type { JournalEntry, CreateJournalEntryDTO, ReverseJournalEntryDTO } from '../types/journal_entries_models';

export const journalEntriesService = {
  async fetchAll(params?: { date_from?: string; date_to?: string; entry_type?: string; reference_type?: string; fiscal_period_id?: string }): Promise<JournalEntry[]> {
    return journalEntriesApi.getAll(params);
  },

  async fetchById(id: string): Promise<JournalEntry> {
    if (!id) throw new Error('Journal Entry ID is required');
    return journalEntriesApi.getById(id);
  },

  async create(dto: CreateJournalEntryDTO): Promise<JournalEntry> {
    if (!dto.entry_date) throw new Error('Entry date is required');
    if (!dto.lines || dto.lines.length === 0) throw new Error('At least one line is required');
    return journalEntriesApi.create(dto);
  },

  async reverse(id: string, dto?: ReverseJournalEntryDTO): Promise<JournalEntry> {
    if (!id) throw new Error('Journal Entry ID is required');
    return journalEntriesApi.reverse(id, dto);
  },
};
