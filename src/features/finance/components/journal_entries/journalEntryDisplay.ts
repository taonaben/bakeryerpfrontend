import type { JournalEntry } from '../../types/journal_entries_models';

export function getEntryTotals(entry: JournalEntry): { debit: number; credit: number } {
  const directDebit = toNumber((entry as any).debit_total ?? (entry as any).total_debits);
  const directCredit = toNumber((entry as any).credit_total ?? (entry as any).total_credits);

  if (directDebit || directCredit) {
    return { debit: directDebit, credit: directCredit };
  }

  return (entry.lines ?? []).reduce(
    (totals, line) => {
      const amount = toNumber(line.amount);
      if (line.type === 'debit') totals.debit += amount;
      if (line.type === 'credit') totals.credit += amount;
      return totals;
    },
    { debit: 0, credit: 0 },
  );
}

export function getLinkedEntryNumber(entry: JournalEntry, key: string): string {
  const value = (entry as any)[key];
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.entry_number || value.id || '';
}

export function isEntryBalanced(totals: { debit: number; credit: number }): boolean {
  return Math.abs(totals.debit - totals.credit) < 0.005;
}

export function toNumber(value: number | string | null | undefined): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatEntryType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
