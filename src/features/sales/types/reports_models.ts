// ──────────────────────────────────────────────
// Sales Reports
// ──────────────────────────────────────────────

export interface DailySummary {
  date: string;
  warehouse_id: string | null;
  warehouse_name: string | null;
  total_transactions: number;
  total_revenue: string;
  total_cogs: string;
  gross_profit: string;
}

export interface RevenueByProduct {
  product_id: string;
  product_name: string;
  total_quantity_sold: string;
  total_revenue: string;
}

export interface MarginByProduct {
  product_id: string;
  product_name: string;
  total_revenue: string;
  total_cogs: string;
  gross_profit: string;
  margin_percentage: string | null;
}

export interface CustomerStatement {
  customer_id: string;
  customer_name: string;
  total_ordered: string;
  total_invoiced: string;
  total_paid: string;
  outstanding_balance: string;
  orders: any[];
  invoices: any[];
  payments: any[];
}

export interface OutstandingDebtor {
  customer_id: string;
  customer_name: string;
  company_name: string | null;
  outstanding_balance: string;
  oldest_due_date: string | null;
  days_overdue: number | null;
}

export interface SalesByWarehouse {
  warehouse_id: string;
  warehouse_name: string;
  total_orders: number;
  total_revenue: string;
  total_cogs: string;
  gross_profit: string;
}

export interface DailySummaryParams {
  date?: string;
  warehouse_id?: string;
}

export interface DateRangeWarehouseParams {
  date_from?: string;
  date_to?: string;
  warehouse_id?: string;
}
