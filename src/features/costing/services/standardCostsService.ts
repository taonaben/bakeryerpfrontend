import { standardCostsApi } from '../api/standard_costs_client';
import type {
  StandardCost,
  StandardCostDetail,
  StandardCostLine,
  ComputeStandardCostDTO,
  StandardCostFilters,
} from '../types/standard_costs_models';

// ──────────────────────────────────────────────
// Standard Costs Service
// ──────────────────────────────────────────────

export const standardCostsService = {
  async fetchAll(filters?: StandardCostFilters): Promise<{
    data: StandardCost[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = buildParams(filters);
    const response = await standardCostsApi.getAll(params);
    const pageSize = params.page_size || 25;
    return {
      data: response.results.map(normalizeList),
      count: response.count,
      currentPage: params.page || 1,
      totalPages: Math.ceil(response.count / pageSize),
    };
  },

  async fetchById(id: string): Promise<StandardCostDetail> {
    if (!id) throw new Error('Standard Cost ID is required');
    const raw = await standardCostsApi.getById(id);
    return normalizeDetail(raw);
  },

  async fetchLines(id: string): Promise<StandardCostLine[]> {
    if (!id) throw new Error('Standard Cost ID is required');
    return standardCostsApi.getLines(id);
  },

  async compute(dto: ComputeStandardCostDTO): Promise<StandardCostDetail> {
    if (!dto.formula_id) throw new Error('Formula is required');
    if (!dto.warehouse_id) throw new Error('Warehouse is required');
    const raw = await standardCostsApi.compute(dto);
    return normalizeDetail(raw);
  },
};

// ── Helpers ──────────────────────────────────

function normalizeList(raw: any): StandardCost {
  return {
    ...raw,
    total_standard_cost_per_unit: raw.total_standard_cost_per_unit ?? '0',
    material_cost_per_unit: raw.material_cost_per_unit ?? '0',
    overhead_cost_per_unit: raw.overhead_cost_per_unit ?? '0',
    overhead_allocation_method: raw.overhead_allocation_method || undefined,
  };
}

function normalizeDetail(raw: any): StandardCostDetail {
  return {
    ...normalizeList(raw),
    overhead_rate: raw.overhead_rate ?? '',
    batch_size_used: raw.batch_size_used ?? '0',
    yield_percentage_used: raw.yield_percentage_used ?? '0',
    computed_by: raw.computed_by ?? '',
    computed_by_name: raw.computed_by_name ?? '',
    lines: Array.isArray(raw.lines) ? raw.lines : [],
  };
}

function buildParams(filters?: StandardCostFilters): Record<string, any> {
  const params: Record<string, any> = {};
  if (!filters) return { page: 1, page_size: 25 };
  if (filters.product_id) params.product_id = filters.product_id;
  if (filters.formula_id) params.formula_id = filters.formula_id;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.search) params.search = filters.search;
  if (filters.ordering) params.ordering = filters.ordering;
  params.page = filters.page || 1;
  params.page_size = filters.page_size || 25;
  return params;
}
