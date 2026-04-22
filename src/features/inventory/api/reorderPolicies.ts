import apiClient from '@/shared/services/api';
import type {
  CreateReorderPolicyDTO,
  PaginatedReorderPolicyResponse,
  ReorderPolicy,
  UpdateReorderPolicyDTO,
} from '../types/reorderPolicyModel';

const toPaginated = (data: any): PaginatedReorderPolicyResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }
  return data;
};

export const reorderPoliciesApi = {
  async getReorderPolicies(
    params: Record<string, any>,
  ): Promise<PaginatedReorderPolicyResponse> {
    const { data } = await apiClient.get('/reorder_policies', { params });
    return toPaginated(data);
  },

  async getReorderPolicy(id: string): Promise<ReorderPolicy> {
    const { data } = await apiClient.get(`/reorder_policies/${id}`);
    return data;
  },

  async createReorderPolicy(
    payload: CreateReorderPolicyDTO,
  ): Promise<ReorderPolicy> {
    const { data } = await apiClient.post('/reorder_policies', payload);
    return data;
  },

  async updateReorderPolicy(
    id: string,
    payload: UpdateReorderPolicyDTO,
  ): Promise<ReorderPolicy> {
    const { data } = await apiClient.put(`/reorder_policies/${id}`, payload);
    return data;
  },

  async deleteReorderPolicy(id: string): Promise<void> {
    await apiClient.delete(`/reorder_policies/${id}`);
  },
};
