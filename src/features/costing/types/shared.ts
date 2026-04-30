// ──────────────────────────────────────────────
// Costing – Shared primitives
// ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Timestamp {
  created_at: string;
  updated_at: string;
}
