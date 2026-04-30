// ──────────────────────────────────────────────
// COGS Posting
// ──────────────────────────────────────────────

export interface CogsPostingResultLine {
  product: string;
  cogs: string;
  revenue: string;
  gross_profit: string;
  cost_source: string;
  journal_entry_id: string;
}

export interface CogsPostingResult {
  lines_posted: number;
  results: CogsPostingResultLine[];
}

export interface PostCogsDTO {
  sales_order_id: string;
}
