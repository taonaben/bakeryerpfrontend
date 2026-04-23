export type ProductUnitOfMeasure =
  | 'kg'
  | 'g'
  | 'l'
  | 'ml'
  | 'pieces'
  | 'dozen'
  | 'box';

export type ProductStorageCondition = 'ambient' | 'refrigerated' | 'frozen';

export interface Product {
  id: string;
  sku: string;
  name: string;
  company?: string;
  category: string;
  unit_of_measure: ProductUnitOfMeasure;
  unit_of_measure_display?: string;
  shelf_life_days?: number;
  storage_conditions?: ProductStorageCondition;
  storage_notes?: string;
  has_reorder_policy?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductDTO {
  name: string;
  company: string;
  category: string;
  unit_of_measure: ProductUnitOfMeasure;
  shelf_life_days: number;
  storage_conditions: ProductStorageCondition;
  storage_notes?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface PaginatedProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
