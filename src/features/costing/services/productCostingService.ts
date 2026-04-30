import { productCostingApi } from '../api/product_costing_client';
import type { StandardCostDetail } from '../types/standard_costs_models';
import type { PricingRule } from '../types/pricing_rules_models';
import type { CostingEntryDetail } from '../types/costing_entries_models';

// ──────────────────────────────────────────────
// Product Costing Service
// Aggregates product-scoped and batch-scoped endpoints
// ──────────────────────────────────────────────

export const productCostingService = {
  async getLatestStandardCost(productId: string): Promise<StandardCostDetail> {
    if (!productId) throw new Error('Product ID is required');
    return productCostingApi.getLatestStandardCost(productId);
  },

  async getPricingRule(productId: string): Promise<PricingRule> {
    if (!productId) throw new Error('Product ID is required');
    return productCostingApi.getPricingRule(productId);
  },

  async getBatchCostingEntry(batchId: string): Promise<CostingEntryDetail> {
    if (!batchId) throw new Error('Batch ID is required');
    return productCostingApi.getBatchCostingEntry(batchId);
  },
};
