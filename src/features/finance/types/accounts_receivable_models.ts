export type ARStatus = 'open' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface AccountsReceivable {
  id: string;
  customer: string;
  customer_name: string;
  invoice: string;
  invoice_number: string;
  original_amount: number | string;
  amount_paid: number | string;
  amount_outstanding: number | string;
  due_date: string;
  status: ARStatus;
  journal_entry: string | null;
  entry_number: string | null;
  created_at: string;
  updated_at: string;
}
