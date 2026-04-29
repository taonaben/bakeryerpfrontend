import apiClient from '@/shared/services/api';
import type {
  PricingRule,
  CreatePricingRuleDTO,
  UpdatePricingRuleDTO,
  PaginatedResponse,
} from '../types/pricing_rules_models';

const BASE = '/costing/pricing-rules';

export const pricingRulesApi = {
  getAll: async (params?: Record<string, any>): Promise<PaginatedResponse<PricingRule>> => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<PricingRule> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  create: async (dto: CreatePricingRuleDTO): Promise<PricingRule> => {
    const { data } = await apiClient.post(BASE, dto);
    return data;
  },

  patch: async (id: string, dto: UpdatePricingRuleDTO): Promise<PricingRule> => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, dto);
    return data;
  },

  recalculate: async (id: string): Promise<PricingRule> => {
    const { data } = await apiClient.post(`${BASE}/${id}/recalculate`);
    return data;
  },
};
