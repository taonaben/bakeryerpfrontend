import { pricingRulesApi } from '../api/pricing_rules_client';
import type {
  PricingRule,
  CreatePricingRuleDTO,
  UpdatePricingRuleDTO,
  PricingRuleFilters,
} from '../types/pricing_rules_models';

// ──────────────────────────────────────────────
// Pricing Rules Service
// ──────────────────────────────────────────────

export const pricingRulesService = {
  async fetchAll(filters?: PricingRuleFilters): Promise<{
    data: PricingRule[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = buildParams(filters);
    const response = await pricingRulesApi.getAll(params);
    const pageSize = params.page_size || 25;
    return {
      data: response.results.map(normalize),
      count: response.count,
      currentPage: params.page || 1,
      totalPages: Math.ceil(response.count / pageSize),
    };
  },

  async fetchById(id: string): Promise<PricingRule> {
    if (!id) throw new Error('Pricing Rule ID is required');
    const raw = await pricingRulesApi.getById(id);
    return normalize(raw);
  },

  async create(dto: CreatePricingRuleDTO): Promise<PricingRule> {
    validate(dto);
    const raw = await pricingRulesApi.create(dto);
    return normalize(raw);
  },

  async patch(id: string, dto: UpdatePricingRuleDTO): Promise<PricingRule> {
    if (!id) throw new Error('Pricing Rule ID is required');
    const raw = await pricingRulesApi.patch(id, dto);
    return normalize(raw);
  },

  async recalculate(id: string): Promise<PricingRule> {
    if (!id) throw new Error('Pricing Rule ID is required');
    const raw = await pricingRulesApi.recalculate(id);
    return normalize(raw);
  },
};

// ── Helpers ──────────────────────────────────

function normalize(raw: any): PricingRule {
  return {
    ...raw,
    recommended_selling_price: raw.recommended_selling_price ?? '0',
    minimum_selling_price: raw.minimum_selling_price ?? '0',
    target_gross_margin_percentage: raw.target_gross_margin_percentage ?? '0',
    minimum_margin_percentage: raw.minimum_margin_percentage ?? '0',
    updated_by_name: raw.updated_by_name ?? '',
  };
}

function validate(dto: CreatePricingRuleDTO): void {
  if (!dto.product) throw new Error('Product is required');
  if (!dto.target_gross_margin_percentage) throw new Error('Target gross margin is required');
  if (!dto.minimum_margin_percentage) throw new Error('Minimum margin is required');
  if (!dto.currency) throw new Error('Currency is required');
  const target = parseFloat(dto.target_gross_margin_percentage);
  const min = parseFloat(dto.minimum_margin_percentage);
  if (isNaN(target) || target < 0 || target > 100) {
    throw new Error('Target gross margin must be between 0 and 100');
  }
  if (isNaN(min) || min < 0 || min > target) {
    throw new Error('Minimum margin must be between 0 and target margin');
  }
}

function buildParams(filters?: PricingRuleFilters): Record<string, any> {
  const params: Record<string, any> = {};
  if (!filters) return { page: 1, page_size: 25 };
  if (filters.product_id) params.product_id = filters.product_id;
  if (filters.search) params.search = filters.search;
  if (filters.ordering) params.ordering = filters.ordering;
  params.page = filters.page || 1;
  params.page_size = filters.page_size || 25;
  return params;
}
