export type EntryType = 'manual' | 'automated' | 'reversal';
export type DebitCredit = 'debit' | 'credit';

export interface JournalEntryLine {
  id: string;
  account: string;
  account_code: string;
  account_name: string;
  type: DebitCredit;
  amount: number | string;
  description: string;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  entry_type: EntryType;
  fiscal_period: string | null;
  fiscal_period_name: string | null;
  reference_type: string;
  reference_id: string | null;
  description: string;
  is_balanced: boolean;
  is_reversed: boolean;
  reversed_by?: string | null;
  created_by?: string;
  created_at: string;
  lines?: JournalEntryLine[];
}

export interface CreateJournalEntryLineDTO {
  account_code: string;
  type: DebitCredit;
  amount: number;
  description?: string;
}

export interface CreateJournalEntryDTO {
  entry_date: string;
  description: string;
  lines: CreateJournalEntryLineDTO[];
}

export interface ReverseJournalEntryDTO {
  reason?: string;
}
