import apiClient from '@/shared/services/api';
import type {
  ProductionOverviewScheduleAdherence,
  ProductionOverviewScheduleAdherenceParams,
  ProductionOverviewSummary,
  ProductionOverviewSummaryParams,
  ProductionOverviewWip,
  ProductionOverviewWipParams,
  ProductionOverviewYieldTrends,
  ProductionOverviewYieldTrendsParams,
} from '../types/productionOverviewModels';

export const productionOverviewClient = {
  async getSummary(
    params?: ProductionOverviewSummaryParams,
  ): Promise<ProductionOverviewSummary> {
    const { data } = await apiClient.get('/production/overview/summary', { params });
    return data;
  },

  async getWip(params?: ProductionOverviewWipParams): Promise<ProductionOverviewWip> {
    const { data } = await apiClient.get('/production/overview/wip', { params });
    return data;
  },

  async getYieldTrends(
    params?: ProductionOverviewYieldTrendsParams,
  ): Promise<ProductionOverviewYieldTrends> {
    const { data } = await apiClient.get('/production/overview/yield-trends', {
      params,
    });
    return data;
  },

  async getScheduleAdherence(
    params?: ProductionOverviewScheduleAdherenceParams,
  ): Promise<ProductionOverviewScheduleAdherence> {
    const { data } = await apiClient.get('/production/overview/schedule-adherence', {
      params,
    });
    return data;
  },
};

export default productionOverviewClient;
