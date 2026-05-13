export interface TrialBalanceLine {
  account_code: string;
  account_name: string;
  account_type: string;
  account_subtype: string;
  total_debits: number;
  total_credits: number;
  balance: number;
  normal_balance: 'debit' | 'credit';
}

export interface TrialBalanceReport {
  date_from: string;
  date_to: string;
  fiscal_period: string | null;
  total_debits: number;
  total_credits: number;
  is_balanced: boolean;
  lines: TrialBalanceLine[];
}

export interface IncomeStatementLine {
  account_code: string;
  account_name: string;
  amount: number;
}

export interface IncomeStatementReport {
  date_from: string;
  date_to: string;
  revenue: IncomeStatementLine[];
  cost_of_sales: IncomeStatementLine[];
  operating_expenses: IncomeStatementLine[];
  total_revenue: number;
  total_cost_of_sales: number;
  gross_profit: number;
  total_operating_expenses: number;
  net_profit: number;
}

export interface BalanceSheetLine {
  account_code: string;
  account_name: string;
  balance: number;
}

export interface BalanceSheetReport {
  as_of_date: string;
  assets: BalanceSheetLine[];
  liabilities: BalanceSheetLine[];
  equity: BalanceSheetLine[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  is_balanced: boolean;
}

export interface ARAgingLine {
  customer_id: string;
  customer_name: string;
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  over_90: number;
  total_outstanding: number;
}

export interface ARAgingReport {
  items: ARAgingLine[];
}

export interface APAgingLine {
  supplier_id: string;
  supplier_name: string;
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  over_90: number;
  total_outstanding: number;
}

export interface APAgingReport {
  items: APAgingLine[];
}
