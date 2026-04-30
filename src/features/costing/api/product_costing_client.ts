import apiClient from '@/shared/services/api';
import type { StandardCostDetail } from '../types/standard_costs_models';
import type { PricingRule } from '../types/pricing_rules_models';
import type { CostingEntryDetail } from '../types/costing_entries_models';

export const productCostingApi = {
  getLatestStandardCost: async (productId: string): Promise<StandardCostDetail> => {
    const { data } = await apiClient.get(`/costing/products/${productId}/standard-cost/latest`);
    return data;
  },

  getPricingRule: async (productId: string): Promise<PricingRule> => {
    const { data } = await apiClient.get(`/costing/products/${productId}/pricing-rule`);
    return data;
  },

  getBatchCostingEntry: async (batchId: string): Promise<CostingEntryDetail> => {
    const { data } = await apiClient.get(`/costing/production/batches/${batchId}/costing-entry`);
    return data;
  },
};
