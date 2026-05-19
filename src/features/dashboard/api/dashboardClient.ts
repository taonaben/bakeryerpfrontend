import apiClient from '@/shared/services/api';
import type {
  DashboardLayoutItem,
  DashboardWidgetRegistry,
} from '../types/dashboardTypes';

export const dashboardClient = {
  async getWidgets(): Promise<DashboardWidgetRegistry> {
    const { data } = await apiClient.get('/dashboard/widgets/');
    return data;
  },

  async getLayout(): Promise<DashboardLayoutItem[]> {
    const { data } = await apiClient.get('/dashboard/layout/');
    return data;
  },

  async saveLayout(layout: DashboardLayoutItem[]): Promise<DashboardLayoutItem[]> {
    const { data } = await apiClient.put('/dashboard/layout/', layout);
    return data;
  },

  async fetchWidgetEndpoint(endpoint: string): Promise<unknown> {
    const { data } = await apiClient.get(endpoint);
    return data;
  },
};
