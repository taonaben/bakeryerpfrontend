export type FiscalPeriodStatus = 'open' | 'closed';

export interface FiscalPeriod {
  id: string;
  name: string;
  period_start: string;
  period_end: string;
  status: FiscalPeriodStatus;
  closed_at: string | null;
  closed_by: string | null;
  closed_by_name: string;
  created_at: string;
}

export interface CreateFiscalPeriodDTO {
  name: string;
  period_start: string;
  period_end: string;
}
