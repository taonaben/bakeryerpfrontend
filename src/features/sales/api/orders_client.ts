import apiClient from '@/shared/services/api';
import type {
  SalesOrder,
  SalesOrderDetail,
  CreateSalesOrderDTO,
  UpdateSalesOrderDTO,
  AddOrderLineDTO,
  UpdateOrderLineDTO,
  OrderLine,
  CancelOrderDTO,
  POSSaleDTO,
  ResolvedPrice,
  ResolvePriceParams,
} from '../types/orders_models';
import type { Delivery } from '../types/deliveries_models';
import type { InvoiceDetail } from '../types/invoices_models';

const BASE = '/sales/orders';
const PRICING_BASE = '/sales/pricing';

export const ordersApi = {
  getAll: async (params?: Record<string, any>): Promise<SalesOrder[]> => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<SalesOrderDetail> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  create: async (dto: CreateSalesOrderDTO): Promise<SalesOrderDetail> => {
    const { data } = await apiClient.post(BASE, dto);
    return data;
  },

  patch: async (id: string, dto: UpdateSalesOrderDTO): Promise<SalesOrderDetail> => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, dto);
    return data;
  },

  addLine: async (id: string, dto: AddOrderLineDTO): Promise<OrderLine> => {
    const { data } = await apiClient.post(`${BASE}/${id}/lines`, dto);
    return data;
  },

  updateLine: async (
    id: string,
    lineId: string,
    dto: UpdateOrderLineDTO,
  ): Promise<OrderLine> => {
    const { data } = await apiClient.patch(`${BASE}/${id}/lines/${lineId}`, dto);
    return data;
  },

  removeLine: async (id: string, lineId: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}/lines/${lineId}`);
  },

  confirm: async (id: string): Promise<SalesOrderDetail> => {
    const { data } = await apiClient.post(`${BASE}/${id}/confirm`);
    return data;
  },

  cancel: async (id: string, dto?: CancelOrderDTO): Promise<SalesOrderDetail> => {
    const { data } = await apiClient.post(`${BASE}/${id}/cancel`, dto ?? {});
    return data;
  },

  getDeliveries: async (id: string): Promise<Delivery[]> => {
    const { data } = await apiClient.get(`${BASE}/${id}/deliveries`);
    return data;
  },

  dispatch: async (orderId: string): Promise<Delivery> => {
    const { data } = await apiClient.post(`${BASE}/${orderId}/dispatch`);
    return data;
  },

  getInvoice: async (orderId: string): Promise<InvoiceDetail> => {
    const { data } = await apiClient.get(`${BASE}/${orderId}/invoice`);
    return data;
  },

  generateInvoice: async (orderId: string): Promise<InvoiceDetail> => {
    const { data } = await apiClient.post(`${BASE}/${orderId}/invoice/generate`);
    return data;
  },

  posSale: async (dto: POSSaleDTO): Promise<SalesOrderDetail> => {
    const { data } = await apiClient.post(`${BASE}/pos`, dto);
    return data;
  },

  resolvePrice: async (params: ResolvePriceParams): Promise<ResolvedPrice> => {
    const { data } = await apiClient.get(`${PRICING_BASE}/resolve`, { params });
    return data;
  },
};
