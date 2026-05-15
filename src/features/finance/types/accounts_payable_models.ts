export type APStatus = 'open' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'mobile_money';

export interface APPayment {
  id: string;
  accounts_payable: string;
  amount: number | string;
  payment_date: string;
  payment_method: PaymentMethod;
  bank_account: string | null;
  bank_account_name: string | null;
  reference: string;
  journal_entry: string | null;
  entry_number: string | null;
  paid_by: string;
  notes: string;
  created_at: string;
}

export interface AccountsPayable {
  id: string;
  supplier: string;
  supplier_name: string;
  supplier_invoice: string;
  invoice_number: string;
  original_amount: number | string;
  amount_paid: number | string;
  amount_outstanding: number | string;
  due_date: string;
  status: APStatus;
  journal_entry: string | null;
  entry_number: string | null;
  created_at: string;
  updated_at: string;
  payments?: APPayment[];
}

export interface PayAPDTO {
  amount: number;
  payment_method: PaymentMethod;
  bank_account?: string | null;
  reference?: string;
  notes?: string;
}
