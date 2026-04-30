import { overheadRatesApi } from '../api/overhead_rates_client';
import type {
  OverheadRate,
  CreateOverheadRateDTO,
  UpdateOverheadRateDTO,
  OverheadRateFilters,
} from '../types/overhead_rates_models';

// ──────────────────────────────────────────────
// Overhead Rates Service
// Validation → API call → Normalisation
// ──────────────────────────────────────────────

export const overheadRatesService = {
  async fetchAll(filters?: OverheadRateFilters): Promise<{
    data: OverheadRate[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = buildParams(filters);
    const response = await overheadRatesApi.getAll(params);
    const pageSize = params.page_size || 25;
    return {
      data: response.results.map(normalize),
      count: response.count,
      currentPage: params.page || 1,
      totalPages: Math.ceil(response.count / pageSize),
    };
  },

  async fetchById(id: string): Promise<OverheadRate> {
    if (!id) throw new Error('Overhead Rate ID is required');
    const raw = await overheadRatesApi.getById(id);
    return normalize(raw);
  },

  async fetchActive(warehouseId: string, date?: string): Promise<OverheadRate> {
    if (!warehouseId) throw new Error('Warehouse ID is required');
    const raw = await overheadRatesApi.getActive({ warehouse_id: warehouseId, date });
    return normalize(raw);
  },

  async create(dto: CreateOverheadRateDTO): Promise<OverheadRate> {
    validate(dto);
    const raw = await overheadRatesApi.create(dto);
    return normalize(raw);
  },

  async patch(id: string, dto: UpdateOverheadRateDTO): Promise<OverheadRate> {
    if (!id) throw new Error('Overhead Rate ID is required');
    const raw = await overheadRatesApi.patch(id, dto);
    return normalize(raw);
  },
};

// ── Helpers ──────────────────────────────────

function normalize(raw: any): OverheadRate {
  return {
    ...raw,
    total_overhead_budgeted: raw.total_overhead_budgeted ?? '0',
    planned_production_units: raw.planned_production_units ?? '0',
    rate_per_unit: raw.rate_per_unit ?? '0',
    notes: raw.notes ?? '',
  };
}

function validate(dto: CreateOverheadRateDTO): void {
  if (!dto.warehouse) throw new Error('Warehouse is required');
  if (!dto.period_start) throw new Error('Period start date is required');
  if (!dto.period_end) throw new Error('Period end date is required');
  if (!dto.total_overhead_budgeted) throw new Error('Total overhead budgeted is required');
  if (!dto.planned_production_units) throw new Error('Planned production units is required');
  if (!dto.currency) throw new Error('Currency is required');
  if (new Date(dto.period_end) <= new Date(dto.period_start)) {
    throw new Error('Period end must be after period start');
  }
}

function buildParams(filters?: OverheadRateFilters): Record<string, any> {
  const params: Record<string, any> = {};
  if (!filters) return { page: 1, page_size: 25 };
  if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;
  if (filters.period_start) params.period_start = filters.period_start;
  if (filters.period_end) params.period_end = filters.period_end;
  if (filters.search) params.search = filters.search;
  if (filters.ordering) params.ordering = filters.ordering;
  params.page = filters.page || 1;
  params.page_size = filters.page_size || 25;
  return params;
}
