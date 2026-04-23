import { reorderPoliciesApi } from '../api/reorderPolicies';
import type {
  CreateReorderPolicyDTO,
  ReorderPolicy,
  UpdateReorderPolicyDTO,
} from '../types/reorderPolicyModel';

export const reorderPolicyService = {
  async fetchReorderPolicies(params: Record<string, any>) {
    const response = await reorderPoliciesApi.getReorderPolicies(params);
    const pageSize = Number(params.page_size || 25);
    const currentPage = Number(params.page || 1);
    const totalPages = Math.max(1, Math.ceil(response.count / pageSize));

    return {
      data: response.results,
      count: response.count,
      currentPage,
      totalPages,
    };
  },

  async getReorderPolicy(id: string): Promise<ReorderPolicy> {
    return reorderPoliciesApi.getReorderPolicy(id);
  },

  async createReorderPolicy(
    payload: CreateReorderPolicyDTO,
  ): Promise<ReorderPolicy> {
    return reorderPoliciesApi.createReorderPolicy(payload);
  },

  async updateReorderPolicy(
    id: string,
    payload: UpdateReorderPolicyDTO,
  ): Promise<ReorderPolicy> {
    return reorderPoliciesApi.updateReorderPolicy(id, payload);
  },

  async deleteReorderPolicy(id: string): Promise<void> {
    return reorderPoliciesApi.deleteReorderPolicy(id);
  },
};
