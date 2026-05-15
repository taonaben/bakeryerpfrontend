import { formulationApi } from '../api/client';
import type {
  CreateFormulaWithLinesDTO,
  Formula,
  FormulaLine,
  FormulaLineType,
  FormulaStatus,
  PutFormulaOnHoldDTO,
  UpdateFormulaDTO,
} from '../types/models';

const FORMULA_STATUS_VALUES: FormulaStatus[] = [
  'draft',
  'active',
  'archived',
  'deactivated',
  'inactive',
  'on_hold',
];

const PRODUCT_REQUIRED_LINE_TYPES: FormulaLineType[] = ['MATERIAL', 'BYPRODUCT'];
const TEXT_REQUIRED_LINE_TYPES: FormulaLineType[] = ['TEXT', 'INSTRUCTION', 'PROCESS'];

export const formulationService = {
  async fetchFormulas(
    filterParams?: Record<string, any>,
    page: number = 1,
  ): Promise<{ data: Formula[]; count: number; currentPage: number; totalPages: number }> {
    const apiParams: Record<string, any> = {};

    if (filterParams && typeof filterParams === 'object') {
      Object.entries(filterParams).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          apiParams[key] = value;
        }
      });
    } else {
      apiParams.page = page;
    }

    const response = await formulationApi.getFormulas(apiParams);
    const pageSize = apiParams.page_size || 25;

    return {
      data: response.results.map((formula) => this.normalizeFormula(formula)),
      count: response.count,
      currentPage: apiParams.page || 1,
      totalPages: Math.max(1, Math.ceil(response.count / pageSize)),
    };
  },

  async fetchFormula(id: string): Promise<Formula> {
    if (!id) throw new Error('Formula ID is required');
    const formula = await formulationApi.getFormula(id);
    return this.normalizeFormula(formula);
  },

  async createFormulaWithLines(dto: CreateFormulaWithLinesDTO): Promise<Formula> {
    this.validateCreateFormula(dto);
    const created = await formulationApi.createFormulaWithLines(this.serializeCreateFormula(dto));
    return this.normalizeFormula(created);
  },

  async updateFormula(id: string, dto: UpdateFormulaDTO): Promise<Formula> {
    if (!id) throw new Error('Formula ID is required');
    const updated = await formulationApi.updateFormula(id, dto);
    return this.normalizeFormula(updated);
  },

  async patchFormula(id: string, dto: UpdateFormulaDTO): Promise<Formula> {
    if (!id) throw new Error('Formula ID is required');
    const updated = await formulationApi.patchFormula(id, dto);
    return this.normalizeFormula(updated);
  },

  async deleteFormula(id: string): Promise<void> {
    if (!id) throw new Error('Formula ID is required');
    await formulationApi.deleteFormula(id);
  },

  async activateFormula(id: string): Promise<Formula> {
    if (!id) throw new Error('Formula ID is required');
    const result = await formulationApi.activateFormula(id);
    return this.normalizeFormula(result);
  },

  async archiveFormula(id: string): Promise<Formula> {
    if (!id) throw new Error('Formula ID is required');
    const result = await formulationApi.archiveFormula(id);
    return this.normalizeFormula(result);
  },

  async deactivateFormula(id: string): Promise<Formula> {
    if (!id) throw new Error('Formula ID is required');
    const result = await formulationApi.deactivateFormula(id);
    return this.normalizeFormula(result);
  },

  async putFormulaOnHold(id: string, dto: PutFormulaOnHoldDTO): Promise<Formula> {
    if (!id) throw new Error('Formula ID is required');
    if (!dto.reason?.trim()) throw new Error('Hold reason is required');
    const result = await formulationApi.putFormulaOnHold(id, { reason: dto.reason.trim() });
    return this.normalizeFormula(result);
  },

  async releaseFormulaHold(id: string): Promise<Formula> {
    if (!id) throw new Error('Formula ID is required');
    const result = await formulationApi.releaseFormulaHold(id);
    return this.normalizeFormula(result);
  },

  normalizeFormula(raw: any): Formula {
    return {
      ...raw,
      revision: Number(raw.revision ?? 0),
      batch_size: Number(raw.batch_size ?? 0),
      yield_percentage: Number(raw.yield_percentage ?? 0),
      labor_minutes_per_batch:
        raw.labor_minutes_per_batch === undefined ||
        raw.labor_minutes_per_batch === null ||
        raw.labor_minutes_per_batch === ''
          ? null
          : Number(raw.labor_minutes_per_batch),
      status: this.normalizeStatus(raw.status),
      lines: Array.isArray(raw.lines) ? raw.lines.map((line: any) => this.normalizeLine(line)) : [],
      created_at: raw.created_at || new Date().toISOString(),
      updated_at: raw.updated_at,
    };
  },

  normalizeLine(raw: any): FormulaLine {
    return {
      ...raw,
      sequence: Number(raw.sequence ?? 0),
      quantity:
        raw.quantity === undefined || raw.quantity === null || raw.quantity === ''
          ? undefined
          : Number(raw.quantity),
      product: raw.product ?? null,
      text: raw.text ?? '',
      material_name: raw.material_name ?? '',
    };
  },

  normalizeStatus(status: string): FormulaStatus {
    if (FORMULA_STATUS_VALUES.includes(status as FormulaStatus)) {
      return status as FormulaStatus;
    }

    const normalised = String(status || '').toLowerCase();
    if (normalised === 'on hold') return 'on_hold';
    if (normalised === 'deactivated') return 'deactivated';
    if (normalised === 'inactive') return 'inactive';
    return 'draft';
  },

  validateCreateFormula(dto: CreateFormulaWithLinesDTO): void {
    if (!dto.name?.trim()) throw new Error('Formula name is required');
    if (!dto.product?.trim()) throw new Error('Product is required');
    if (!Number.isFinite(Number(dto.batch_size))) throw new Error('Batch size must be a valid number');
    if (!Number.isFinite(Number(dto.yield_percentage))) {
      throw new Error('Yield percentage must be a valid number');
    }
    if (
      dto.labor_minutes_per_batch !== undefined &&
      !Number.isFinite(Number(dto.labor_minutes_per_batch))
    ) {
      throw new Error('Labor minutes per batch must be a valid number');
    }
    if (!Array.isArray(dto.lines) || dto.lines.length === 0) {
      throw new Error('At least one formula line is required');
    }

    dto.lines.forEach((line, index) => {
      const row = index + 1;
      if (!line.line_type) throw new Error(`Line ${row}: line type is required`);
      if (!Number.isFinite(Number(line.sequence))) {
        throw new Error(`Line ${row}: sequence is required`);
      }

      if (TEXT_REQUIRED_LINE_TYPES.includes(line.line_type) && !line.text?.trim()) {
        throw new Error(`Line ${row}: text is required for ${line.line_type.toLowerCase()} lines`);
      }

      if (PRODUCT_REQUIRED_LINE_TYPES.includes(line.line_type)) {
        if (!line.product?.trim()) {
          throw new Error(`Line ${row}: product is required for ${line.line_type.toLowerCase()} lines`);
        }
        if (!Number.isFinite(Number(line.quantity)) || Number(line.quantity) <= 0) {
          throw new Error(`Line ${row}: quantity must be greater than 0`);
        }
      }

    });
  },

  serializeCreateFormula(dto: CreateFormulaWithLinesDTO): CreateFormulaWithLinesDTO {
    return {
      ...dto,
      batch_size: Number(dto.batch_size),
      yield_percentage: Number(dto.yield_percentage),
      labor_minutes_per_batch:
        dto.labor_minutes_per_batch === undefined ||
        dto.labor_minutes_per_batch === null ||
        dto.labor_minutes_per_batch === ('' as any)
          ? undefined
          : Number(dto.labor_minutes_per_batch),
      lines: dto.lines.map((line) => ({
        ...line,
        sequence: Number(line.sequence),
        quantity:
          line.quantity === undefined || line.quantity === null || line.quantity === ('' as any)
            ? undefined
            : Number(line.quantity),
        text: line.text?.trim() || undefined,
      })),
    };
  },
};
