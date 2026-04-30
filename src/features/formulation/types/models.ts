export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Timestamp {
  created_at: string;
  updated_at?: string;
}

export type FormulaStatus =
  | 'draft'
  | 'active'
  | 'archived'
  | 'deactivated'
  | 'inactive'
  | 'on_hold';

export type FormulaLineType =
  | 'TEXT'
  | 'INSTRUCTION'
  | 'MATERIAL'
  | 'BYPRODUCT'
  | 'PROCESS';

export interface FormulaLine {
  id: string;
  material_name?: string;
  formula: string;
  sequence: number;
  line_type: FormulaLineType;
  product?: string | null;
  quantity?: number;
  text?: string;
}

export interface Formula extends Timestamp {
  id: string;
  name: string;
  product: string;
  revision: number;
  batch_size: number;
  yield_percentage: number;
  status: FormulaStatus;
  lines: FormulaLine[];
}

export interface CreateFormulaDTO {
  name: string;
  product: string;
  revision: number;
  batch_size: number;
  yield_percentage: number;
  status: FormulaStatus;
}

export interface UpdateFormulaDTO extends Partial<CreateFormulaDTO> {
  is_active?: boolean;
  lines?: CreateFormulaLineDTO[];
}

export interface CreateFormulaLineDTO {
  id?: string;
  sequence: number;
  line_type: FormulaLineType;
  product?: string;
  quantity?: number;
  text?: string;
}

export interface CreateFormulaWithLinesDTO extends CreateFormulaDTO {
  is_active?: boolean;
  lines: CreateFormulaLineDTO[];
}

export interface PutFormulaOnHoldDTO {
  reason: string;
}
