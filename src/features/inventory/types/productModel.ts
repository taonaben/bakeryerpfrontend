export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit_of_measure: string;
  unit_of_measure_display?: string;
  shelf_life_days?: number;
  storage_conditions?: string;
  storage_notes?: string;
  has_reorder_policy?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductDTO {
  name: string;
  category: string;
  unit_of_measure: string;
  shelf_life_days: number;
  storage_conditions: string;
  storage_notes?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface PaginatedProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
