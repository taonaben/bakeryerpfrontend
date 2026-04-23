import productionClient from '../api/productionClient';
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
import { toProductionServiceError } from '../utils/errorHandling';

export const productionService = {
  async fetchProductionOrders(params: ProductionQueryParams = {}): Promise<ProductionOrder[]> {
    try {
      return await productionClient.listProductionOrders(params);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to fetch production orders');
    }
  },

  async fetchProductionOrder(id: string): Promise<ProductionOrder> {
    try {
      return await productionClient.getProductionOrder(id);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to fetch production order');
    }
  },

  async createProductionOrder(payload: CreateProductionOrderPayload): Promise<ProductionOrder> {
    try {
      return await productionClient.createProductionOrder(payload);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to create production order');
    }
  },

  async replaceProductionOrder(
    id: string,
    payload: UpdateProductionOrderPayload,
  ): Promise<ProductionOrder> {
    try {
      return await productionClient.replaceProductionOrder(id, payload);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to update production order');
    }
  },

  async updateProductionOrder(
    id: string,
    payload: UpdateProductionOrderPayload,
  ): Promise<ProductionOrder> {
    try {
      return await productionClient.updateProductionOrder(id, payload);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to update production order');
    }
  },

  async deleteProductionOrder(id: string): Promise<void> {
    try {
      await productionClient.deleteProductionOrder(id);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to delete production order');
    }
  },

  async copyProductionOrder(
    id: string,
    payload?: CopyProductionOrderPayload,
  ): Promise<ProductionOrder> {
    try {
      return await productionClient.copyProductionOrder(id, payload);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to copy production order');
    }
  },

  async fetchFinishedProductionOrders(): Promise<ProductionOrderSummary[]> {
    try {
      return await productionClient.listFinishedProductionOrders();
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to fetch finished production orders');
    }
  },

  async fetchProductionOrderSummary(id: string): Promise<ProductionOrderSummary> {
    try {
      return await productionClient.getProductionOrderSummary(id);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to fetch production summary');
    }
  },

  async planProductionOrder(id: string): Promise<ProductionPlan> {
    try {
      return await productionClient.planProductionOrder(id);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to generate production plan');
    }
  },

  async startProductionOrder(
    id: string,
    payload: StartProductionPayload = {},
  ): Promise<StartProductionResponse> {
    try {
      return await productionClient.startProductionOrder(id, payload);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to start production order');
    }
  },

  async getProductionFinishExpectations(id: string): Promise<ProductionFinishExpectations> {
    try {
      return await productionClient.getProductionFinishExpectations(id);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to fetch production finish expectations');
    }
  },

  async finishProductionOrder(
    id: string,
    payload: FinishProductionPayload,
  ): Promise<FinishProductionResponse> {
    try {
      return await productionClient.finishProductionOrder(id, payload);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to finish production order');
    }
  },

  async fetchReworkOrders(params: ProductionQueryParams = {}): Promise<ReworkOrder[]> {
    try {
      return await productionClient.listReworkOrders(params);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to fetch rework orders');
    }
  },

  async fetchReworkOrder(id: string): Promise<ReworkOrder> {
    try {
      return await productionClient.getReworkOrder(id);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to fetch rework order');
    }
  },

  async createReworkOrder(payload: CreateReworkOrderPayload): Promise<ReworkOrder> {
    try {
      return await productionClient.createReworkOrder(payload);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to create rework order');
    }
  },

  async replaceReworkOrder(id: string, payload: UpdateReworkOrderPayload): Promise<ReworkOrder> {
    try {
      return await productionClient.replaceReworkOrder(id, payload);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to update rework order');
    }
  },

  async updateReworkOrder(id: string, payload: UpdateReworkOrderPayload): Promise<ReworkOrder> {
    try {
      return await productionClient.updateReworkOrder(id, payload);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to update rework order');
    }
  },

  async deleteReworkOrder(id: string): Promise<void> {
    try {
      await productionClient.deleteReworkOrder(id);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to delete rework order');
    }
  },

  async startReworkOrder(id: string, payload: StartReworkPayload): Promise<StartReworkResponse> {
    try {
      return await productionClient.startReworkOrder(id, payload);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to start rework order');
    }
  },

  async finishReworkOrder(
    id: string,
    payload: FinishReworkPayload,
  ): Promise<FinishReworkResponse> {
    try {
      return await productionClient.finishReworkOrder(id, payload);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to finish rework order');
    }
  },
};

export default productionService;
