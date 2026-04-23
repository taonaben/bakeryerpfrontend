export type RetrievalMethod = 'FIFO' | 'LIFO' | 'FEFO';

export interface ReorderPolicy {
  id: string;
  product: string;
  warehouse: string;
  min_stock_level: string;
  reorder_qty: string;
  lead_time_days: number;
  retrieval_method: RetrievalMethod;
  safety_stock_qty: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateReorderPolicyDTO {
  product: string;
  warehouse: string;
  min_stock_level: string;
  reorder_qty: string;
  lead_time_days: number;
  retrieval_method: RetrievalMethod;
  safety_stock_qty: string;
  is_active: boolean;
}

export interface UpdateReorderPolicyDTO extends Partial<CreateReorderPolicyDTO> {}

export interface PaginatedReorderPolicyResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReorderPolicy[];
}
