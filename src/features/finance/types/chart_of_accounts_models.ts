export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type NormalBalance = 'debit' | 'credit';

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  account_type: AccountType;
  account_subtype: string;
  normal_balance: NormalBalance;
  system_key: string;
  is_system_account: boolean;
  is_active: boolean;
  description: string;
  created_at: string;
}

export interface CreateChartOfAccountDTO {
  code: string;
  name: string;
  account_type: AccountType;
  account_subtype?: string;
  normal_balance: NormalBalance;
  description?: string;
}

export interface UpdateChartOfAccountDTO {
  name?: string;
  account_subtype?: string;
  description?: string;
  is_active?: boolean;
  code?: string;
}
