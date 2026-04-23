import apiClient from '@/shared/services/api';
import type {
  CopyProductionOrderPayload,
  CreateProductionOrderPayload,
  CreateReworkOrderPayload,
  FinishProductionPayload,
  FinishProductionResponse,
  FinishReworkPayload,
  FinishReworkResponse,
  ProductionFinishExpectations,
  ProductionOrder,
  ProductionOrderSummary,
  ProductionPlan,
  ProductionQueryParams,
  ReworkOrder,
  StartProductionPayload,
  StartProductionResponse,
  StartReworkPayload,
  StartReworkResponse,
  UpdateProductionOrderPayload,
  UpdateReworkOrderPayload,
} from '../types/productionModels';

const toList = <T>(data: T[] | { results?: T[] } | undefined | null): T[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results;
  }

  return [];
};

export const productionClient = {
  async listProductionOrders(params: ProductionQueryParams = {}): Promise<ProductionOrder[]> {
    const { data } = await apiClient.get('/production/orders', { params });
    return toList<ProductionOrder>(data);
  },

  async getProductionOrder(id: string): Promise<ProductionOrder> {
    const { data } = await apiClient.get(`/production/orders/${id}`);
    return data;
  },

  async createProductionOrder(payload: CreateProductionOrderPayload): Promise<ProductionOrder> {
    const { data } = await apiClient.post('/production/orders', payload);
    return data;
  },

  async replaceProductionOrder(
    id: string,
    payload: UpdateProductionOrderPayload,
  ): Promise<ProductionOrder> {
    const { data } = await apiClient.put(`/production/orders/${id}`, payload);
    return data;
  },

  async updateProductionOrder(
    id: string,
    payload: UpdateProductionOrderPayload,
  ): Promise<ProductionOrder> {
    const { data } = await apiClient.patch(`/production/orders/${id}`, payload);
    return data;
  },

  async deleteProductionOrder(id: string): Promise<void> {
    await apiClient.delete(`/production/orders/${id}`);
  },

  async copyProductionOrder(
    id: string,
    payload?: CopyProductionOrderPayload,
  ): Promise<ProductionOrder> {
    const { data } = await apiClient.post(`/production/orders/copy/${id}`, payload ?? {});
    return data;
  },

  async listFinishedProductionOrders(): Promise<ProductionOrderSummary[]> {
    const { data } = await apiClient.get('/production/orders/finished');
    return toList<ProductionOrderSummary>(data);
  },

  async getProductionOrderSummary(id: string): Promise<ProductionOrderSummary> {
    const { data } = await apiClient.get(`/production/orders/${id}/summary`);
    return data;
  },

  async planProductionOrder(id: string): Promise<ProductionPlan> {
    const { data } = await apiClient.post(`/production/orders/${id}/plan`);
    return data;
  },

  async startProductionOrder(
    id: string,
    payload: StartProductionPayload = {},
  ): Promise<StartProductionResponse> {
    const { data } = await apiClient.post(`/production/orders/${id}/start`, payload);
    return data;
  },

  async getProductionFinishExpectations(id: string): Promise<ProductionFinishExpectations> {
    const { data } = await apiClient.get(`/production/orders/${id}/finish`);
    return data;
  },

  async finishProductionOrder(
    id: string,
    payload: FinishProductionPayload,
  ): Promise<FinishProductionResponse> {
    const { data } = await apiClient.post(`/production/orders/${id}/finish`, payload);
    return data;
  },

  async listReworkOrders(params: ProductionQueryParams = {}): Promise<ReworkOrder[]> {
    const { data } = await apiClient.get('/production/rework', { params });
    return toList<ReworkOrder>(data);
  },

  async getReworkOrder(id: string): Promise<ReworkOrder> {
    const { data } = await apiClient.get(`/production/rework/${id}`);
    return data;
  },

  async createReworkOrder(payload: CreateReworkOrderPayload): Promise<ReworkOrder> {
    const { data } = await apiClient.post('/production/rework', payload);
    return data;
  },

  async replaceReworkOrder(id: string, payload: UpdateReworkOrderPayload): Promise<ReworkOrder> {
    const { data } = await apiClient.put(`/production/rework/${id}`, payload);
    return data;
  },

  async updateReworkOrder(id: string, payload: UpdateReworkOrderPayload): Promise<ReworkOrder> {
    const { data } = await apiClient.patch(`/production/rework/${id}`, payload);
    return data;
  },

  async deleteReworkOrder(id: string): Promise<void> {
    await apiClient.delete(`/production/rework/${id}`);
  },

  async startReworkOrder(id: string, payload: StartReworkPayload): Promise<StartReworkResponse> {
    const { data } = await apiClient.post(`/production/rework/${id}/start`, payload);
    return data;
  },

  async finishReworkOrder(
    id: string,
    payload: FinishReworkPayload,
  ): Promise<FinishReworkResponse> {
    const { data } = await apiClient.post(`/production/rework/${id}/finish`, payload);
    return data;
  },
};

export default productionClient;
