import type { AccountsReceivable } from '../types/accounts_receivable_models';
import type {
  AccountsPayable,
  PaymentMethod,
} from '../types/accounts_payable_models';

export type FinanceBalanceFilter = 'all' | 'open' | 'partially_paid' | 'overdue' | 'paid';

export const PAYMENT_METHODS: Array<{ label: string; value: PaymentMethod }> = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'Mobile Money', value: 'mobile_money' },
];

type BalanceRecord = Pick<
  AccountsReceivable | AccountsPayable,
  'amount_outstanding' | 'due_date' | 'status'
>;

export function getEffectiveStatus(record: BalanceRecord): FinanceBalanceFilter {
  if (record.status === 'paid') return 'paid';
  if (record.status === 'partially_paid') return isOverdue(record) ? 'overdue' : 'partially_paid';
  if (record.status === 'overdue') return 'overdue';
  if (isOverdue(record)) return 'overdue';
  return 'open';
}

export function getStatusClass(record: BalanceRecord): string {
  const status = getEffectiveStatus(record);
  if (status === 'open') return 'finance-badge--open-ar';
  if (status === 'partially_paid') return 'finance-badge--partial-ar';
  if (status === 'overdue') return 'finance-badge--overdue-ar';
  if (status === 'paid') return 'finance-badge--paid-ar';
  return 'finance-badge--inactive';
}

export function canPay(record: AccountsPayable): boolean {
  const status = getEffectiveStatus(record);
  return toNumber(record.amount_outstanding) > 0 && ['open', 'partially_paid', 'overdue'].includes(status);
}

export function isOverdue(record: BalanceRecord): boolean {
  return getDaysOverdue(record) > 0;
}

export function getDaysOverdue(record: BalanceRecord): number {
  if (record.status === 'paid' || toNumber(record.amount_outstanding) <= 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${record.due_date}T00:00:00`);
  const diff = Math.floor((today.getTime() - due.getTime()) / 86400000);
  return Math.max(0, diff);
}

export function toNumber(value: number | string | null | undefined): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function dateToMs(value?: string | null): number {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export function formatPlainAmount(value: number): string {
  return value.toFixed(2);
}

export function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatStatus(status: FinanceBalanceFilter): string {
  if (status === 'partially_paid') return 'Partially Paid';
  return status.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatPaymentMethod(method: PaymentMethod): string {
  return PAYMENT_METHODS.find((item) => item.value === method)?.label || method;
}

export function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
