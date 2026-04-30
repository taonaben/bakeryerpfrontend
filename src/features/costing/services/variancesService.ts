import { variancesApi } from '../api/variances_client';
import type {
  Variance,
  VarianceSummaryItem,
  VarianceFilters,
  VarianceSummaryFilters,
} from '../types/variances_models';

// ──────────────────────────────────────────────
// Variances Service
// ──────────────────────────────────────────────

export const variancesService = {
  async fetchAll(filters?: VarianceFilters): Promise<{
    data: Variance[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = buildParams(filters);
    const response = await variancesApi.getAll(params);
    const pageSize = params.page_size || 25;
    return {
      data: response.results.map(normalize),
      count: response.count,
      currentPage: params.page || 1,
      totalPages: Math.ceil(response.count / pageSize),
    };
  },

  async fetchById(id: string): Promise<Variance> {
    if (!id) throw new Error('Variance ID is required');
    const raw = await variancesApi.getById(id);
    return normalize(raw);
  },

  async fetchSummary(filters?: VarianceSummaryFilters): Promise<VarianceSummaryItem[]> {
    return variancesApi.getSummary(filters);
  },
};

// ── Helpers ──────────────────────────────────

function normalize(raw: any): Variance {
  return {
    ...raw,
    total_variance: raw.total_variance ?? '0',
    variance_percentage: raw.variance_percentage ?? '0',
    material_price_variance: raw.material_price_variance ?? '0',
    material_usage_variance: raw.material_usage_variance ?? '0',
    yield_variance: raw.yield_variance ?? '0',
    overhead_variance: raw.overhead_variance ?? '0',
    is_favourable: raw.is_favourable ?? false,
  };
}

function buildParams(filters?: VarianceFilters): Record<string, any> {
  const params: Record<string, any> = {};
  if (!filters) return { page: 1, page_size: 25 };
  if (filters.product_id) params.product_id = filters.product_id;
  if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;
  if (filters.is_favourable !== undefined) params.is_favourable = filters.is_favourable;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.search) params.search = filters.search;
  if (filters.ordering) params.ordering = filters.ordering;
  params.page = filters.page || 1;
  params.page_size = filters.page_size || 25;
  return params;
}
