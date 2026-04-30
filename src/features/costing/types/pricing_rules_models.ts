import type { PaginatedResponse } from './shared';
export type { PaginatedResponse };

// ──────────────────────────────────────────────
// Pricing Rules
// ──────────────────────────────────────────────

export interface PricingRule {
  id: string;
  product: string;
  product_name: string;
  target_gross_margin_percentage: string;
  minimum_margin_percentage: string;
  standard_cost_reference: string;
  recommended_selling_price: string;
  minimum_selling_price: string;
  currency: string;
  last_updated: string;
  updated_by: string;
  updated_by_name: string;
}

export interface CreatePricingRuleDTO {
  product: string;
  target_gross_margin_percentage: string;
  minimum_margin_percentage: string;
  currency: string;
}

export type UpdatePricingRuleDTO = Partial<CreatePricingRuleDTO>;

export interface PricingRuleFilters {
  product_id?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
