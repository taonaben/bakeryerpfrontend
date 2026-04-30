import { ordersApi } from '../api/orders_client';
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
  OrderFilters,
} from '../types/orders_models';
import type { Delivery } from '../types/deliveries_models';
import type { InvoiceDetail } from '../types/invoices_models';

// ──────────────────────────────────────────────
// Sales Orders Service
// ──────────────────────────────────────────────

export const ordersService = {
  async fetchAll(filters?: OrderFilters): Promise<SalesOrder[]> {
    const params = buildParams(filters);
    return ordersApi.getAll(params);
  },

  async fetchById(id: string): Promise<SalesOrderDetail> {
    if (!id) throw new Error('Order ID is required');
    return ordersApi.getById(id);
  },

  async create(dto: CreateSalesOrderDTO): Promise<SalesOrderDetail> {
    if (!dto.customer_id) throw new Error('Customer is required');
    if (!dto.warehouse_id) throw new Error('Warehouse is required');
    return ordersApi.create(dto);
  },

  async patch(id: string, dto: UpdateSalesOrderDTO): Promise<SalesOrderDetail> {
    if (!id) throw new Error('Order ID is required');
    return ordersApi.patch(id, dto);
  },

  async addLine(id: string, dto: AddOrderLineDTO): Promise<OrderLine> {
    if (!id) throw new Error('Order ID is required');
    if (!dto.product_id) throw new Error('Product is required');
    if (!dto.quantity || parseFloat(dto.quantity) <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    return ordersApi.addLine(id, dto);
  },

  async updateLine(
    id: string,
    lineId: string,
    dto: UpdateOrderLineDTO,
  ): Promise<OrderLine> {
    if (!id) throw new Error('Order ID is required');
    if (!lineId) throw new Error('Line ID is required');
    if (!dto.quantity || parseFloat(dto.quantity) <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    return ordersApi.updateLine(id, lineId, dto);
  },

  async removeLine(id: string, lineId: string): Promise<void> {
    if (!id) throw new Error('Order ID is required');
    if (!lineId) throw new Error('Line ID is required');
    return ordersApi.removeLine(id, lineId);
  },

  async confirm(id: string): Promise<SalesOrderDetail> {
    if (!id) throw new Error('Order ID is required');
    return ordersApi.confirm(id);
  },

  async cancel(id: string, dto?: CancelOrderDTO): Promise<SalesOrderDetail> {
    if (!id) throw new Error('Order ID is required');
    return ordersApi.cancel(id, dto);
  },

  async fetchDeliveries(id: string): Promise<Delivery[]> {
    if (!id) throw new Error('Order ID is required');
    return ordersApi.getDeliveries(id);
  },

  async dispatch(orderId: string): Promise<Delivery> {
    if (!orderId) throw new Error('Order ID is required');
    return ordersApi.dispatch(orderId);
  },

  async fetchInvoice(orderId: string): Promise<InvoiceDetail> {
    if (!orderId) throw new Error('Order ID is required');
    return ordersApi.getInvoice(orderId);
  },

  async generateInvoice(orderId: string): Promise<InvoiceDetail> {
    if (!orderId) throw new Error('Order ID is required');
    return ordersApi.generateInvoice(orderId);
  },

  async posSale(dto: POSSaleDTO): Promise<SalesOrderDetail> {
    if (!dto.warehouse_id) throw new Error('Warehouse is required');
    if (!dto.lines?.length) throw new Error('At least one product line is required');
    return ordersApi.posSale(dto);
  },

  async resolvePrice(params: ResolvePriceParams): Promise<ResolvedPrice> {
    if (!params.customer_id) throw new Error('Customer is required');
    if (!params.product_id) throw new Error('Product is required');
    if (!params.warehouse_id) throw new Error('Warehouse is required');
    return ordersApi.resolvePrice(params);
  },
};

// ── Helpers ──────────────────────────────────

function buildParams(filters?: OrderFilters): Record<string, any> {
  const params: Record<string, any> = {};
  if (!filters) return params;
  if (filters.order_type) params.order_type = filters.order_type;
  if (filters.status) params.status = filters.status;
  if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.page) params.page = filters.page;
  if (filters.page_size) params.page_size = filters.page_size;
  return params;
}
