import { costingEntriesApi } from '../api/costing_entries_client';
import type {
  CostingEntry,
  CostingEntryDetail,
  CostingEntryLine,
  ComputeCostingEntryDTO,
  CostingEntryFilters,
} from '../types/costing_entries_models';
import type { Variance } from '../types/variances_models';

// ──────────────────────────────────────────────
// Costing Entries Service
// ──────────────────────────────────────────────

export const costingEntriesService = {
  async fetchAll(filters?: CostingEntryFilters): Promise<{
    data: CostingEntry[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = buildParams(filters);
    const response = await costingEntriesApi.getAll(params);
    const pageSize = params.page_size || 25;
    return {
      data: response.results.map(normalizeList),
      count: response.count,
      currentPage: params.page || 1,
      totalPages: Math.ceil(response.count / pageSize),
    };
  },

  async fetchById(id: string): Promise<CostingEntryDetail> {
    if (!id) throw new Error('Costing Entry ID is required');
    const raw = await costingEntriesApi.getById(id);
    return normalizeDetail(raw);
  },

  async fetchLines(id: string): Promise<CostingEntryLine[]> {
    if (!id) throw new Error('Costing Entry ID is required');
    return costingEntriesApi.getLines(id);
  },

  async fetchVariance(id: string): Promise<Variance> {
    if (!id) throw new Error('Costing Entry ID is required');
    return costingEntriesApi.getVariance(id);
  },

  async compute(dto: ComputeCostingEntryDTO): Promise<CostingEntryDetail> {
    if (!dto.production_batch_id) throw new Error('Production batch is required');
    const raw = await costingEntriesApi.compute(dto);
    return normalizeDetail(raw);
  },
};

// ── Helpers ──────────────────────────────────

function normalizeList(raw: any): CostingEntry {
  return {
    ...raw,
    total_cost: raw.total_cost ?? '0',
    cost_per_unit: raw.cost_per_unit ?? '0',
    actual_output_quantity: raw.actual_output_quantity ?? '0',
    overhead_allocation_method: raw.overhead_allocation_method || undefined,
  };
}

function normalizeDetail(raw: any): CostingEntryDetail {
  return {
    ...normalizeList(raw),
    standard_cost: raw.standard_cost ?? '',
    overhead_rate: raw.overhead_rate ?? '',
    total_material_cost: raw.total_material_cost ?? '0',
    overhead_cost: raw.overhead_cost ?? '0',
    actual_waste_quantity: raw.actual_waste_quantity ?? '0',
    lines: Array.isArray(raw.lines) ? raw.lines : [],
  };
}

function buildParams(filters?: CostingEntryFilters): Record<string, any> {
  const params: Record<string, any> = {};
  if (!filters) return { page: 1, page_size: 25 };
  if (filters.product_id) params.product_id = filters.product_id;
  if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;
  if (filters.batch_id) params.batch_id = filters.batch_id;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.search) params.search = filters.search;
  if (filters.ordering) params.ordering = filters.ordering;
  params.page = filters.page || 1;
  params.page_size = filters.page_size || 25;
  return params;
}
