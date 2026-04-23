import apiClient from '@/shared/services/api';
import type {
  CreateFormulaDTO,
  CreateFormulaWithLinesDTO,
  Formula,
  PaginatedResponse,
  PutFormulaOnHoldDTO,
  UpdateFormulaDTO,
} from '../types/models';

const API_BASE = '/formulation/formulas';

export const formulationApi = {
  getFormulas: async (
    params: Record<string, any>,
  ): Promise<PaginatedResponse<Formula>> => {
    const { data } = await apiClient.get(API_BASE, { params });
    return data;
  },

  getFormula: async (id: string): Promise<Formula> => {
    const { data } = await apiClient.get(`${API_BASE}/${id}`);
    return data;
  },

  createFormula: async (dto: CreateFormulaDTO): Promise<Formula> => {
    const { data } = await apiClient.post(API_BASE, dto);
    return data;
  },

  createFormulaWithLines: async (dto: CreateFormulaWithLinesDTO): Promise<Formula> => {
    const { data } = await apiClient.post(`${API_BASE}/create-with-lines`, dto);
    return data;
  },

  updateFormula: async (id: string, dto: UpdateFormulaDTO): Promise<Formula> => {
    const { data } = await apiClient.put(`${API_BASE}/${id}`, dto);
    return data;
  },

  patchFormula: async (id: string, dto: UpdateFormulaDTO): Promise<Formula> => {
    const { data } = await apiClient.patch(`${API_BASE}/${id}`, dto);
    return data;
  },

  deleteFormula: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/${id}`);
  },

  activateFormula: async (id: string): Promise<Formula> => {
    const { data } = await apiClient.post(`${API_BASE}/${id}/activate`);
    return data;
  },

  archiveFormula: async (id: string): Promise<Formula> => {
    const { data } = await apiClient.post(`${API_BASE}/${id}/archive`);
    return data;
  },

  deactivateFormula: async (id: string): Promise<Formula> => {
    const { data } = await apiClient.post(`${API_BASE}/${id}/deactivate`);
    return data;
  },

  putFormulaOnHold: async (id: string, dto: PutFormulaOnHoldDTO): Promise<Formula> => {
    const { data } = await apiClient.post(`${API_BASE}/${id}/put-on-hold`, dto);
    return data;
  },

  releaseFormulaHold: async (id: string): Promise<Formula> => {
    const { data } = await apiClient.post(`${API_BASE}/${id}/release-hold`);
    return data;
  },
};
