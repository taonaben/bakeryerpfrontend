import apiClient from '@/shared/services/api';
import type {
  Delivery,
  DeliveryDetail,
  ConfirmDeliveryDTO,
  FailDeliveryDTO,
} from '../types/deliveries_models';

const BASE = '/sales/deliveries';

export const deliveriesApi = {
  getAll: async (params?: Record<string, any>): Promise<Delivery[]> => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<DeliveryDetail> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  confirmReceipt: async (id: string, dto?: ConfirmDeliveryDTO): Promise<DeliveryDetail> => {
    const { data } = await apiClient.patch(`${BASE}/${id}/confirm-receipt`, dto ?? {});
    return data;
  },

  fail: async (id: string, dto: FailDeliveryDTO): Promise<DeliveryDetail> => {
    const { data } = await apiClient.patch(`${BASE}/${id}/fail`, dto);
    return data;
  },
};
