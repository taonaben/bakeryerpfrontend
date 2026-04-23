import type { Timestamp, PaginatedResponse } from './models';
import type { GoodsReceipt, GoodsReceiptLineItem } from './grn_models';

export type { PaginatedResponse };

export type SupplierInvoiceStatus = 'Draft' | 'Approved' | 'Rejected' | 'Paid';

export interface SupplierInvoiceLineItem extends Timestamp {
  id: string;
  supplier_invoice: string;
  gr_line_item: string;
  product: string;
  product_name: string;
  quantity_invoiced: number | string;
  unit_of_measure: string;
  unit_price: number | string;
  total_price: number | string;
  description: string | null;
}

export interface SupplierInvoice extends Timestamp {
  id: string;
  invoice_number: string;
  purchase_order: string;
  po_number: string;
  supplier: string;
  supplier_name: string;
  warehouse: string;
  warehouse_name: string;
  invoice_date: string;
  due_date: string;
  total_amount: number | string;
  status: SupplierInvoiceStatus;
  description: string | null;
  approved_by: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  paid_by: string | null;
  payment_reference: string | null;
  item_count: number;
  line_items: SupplierInvoiceLineItem[];
}

export interface CreateSupplierInvoiceLineDTO {
  gr_line_item_id: string;
  product_id: string;
  quantity_invoiced: string;
  unit_of_measure: string;
  unit_price: string;
  description?: string;
}

export interface CreateSupplierInvoiceDTO {
  po_id: string;
  supplier_id: string;
  invoice_date: string;
  due_date: string;
  lines: CreateSupplierInvoiceLineDTO[];
}

export type UpdateSupplierInvoiceDTO = Partial<CreateSupplierInvoiceDTO>;

export interface ApproveSupplierInvoiceDTO {
  approved_by: string;
}

export interface RejectSupplierInvoiceDTO {
  rejected_by: string;
  reason: string;
}

export interface MarkSupplierInvoicePaidDTO {
  paid_by: string;
  payment_reference: string;
}

export interface SupplierInvoiceListFilters {
  search: string;
  status: SupplierInvoiceStatus | '';
  supplier_id: string;
  purchase_order_id: string;
  warehouse_id: string;
  invoice_date_after: string;
  invoice_date_before: string;
  due_date_after: string;
  due_date_before: string;
  ordering: string;
  page: number;
  page_size: number;
}

export interface SupplierInvoiceMatchLine {
  invoice_line_id: string;
  product_id: string;
  product_name: string;
  invoice_qty: number;
  invoice_unit_price: number;
  gr_qty: number;
  gr_unit_price: number;
  po_qty: number;
  po_unit_price: number;
  reason: string;
  price_diff_po: number;
  price_diff_gr: number;
  qty_diff_gr: number;
}

export interface SupplierInvoiceMatchResult {
  matched: SupplierInvoiceMatchLine[];
  price_variance: SupplierInvoiceMatchLine[];
  qty_variance: SupplierInvoiceMatchLine[];
  unmatched: SupplierInvoiceMatchLine[];
}

export interface SupplierInvoiceGoodsReceiptOption {
  id: string;
  gr_number: string;
  purchase_order: string;
  purchase_order_number: string;
  supplier: string;
  supplier_name: string;
  warehouse: string;
  warehouse_name: string;
  received_date: string;
  status: string;
}

export interface SupplierInvoiceCreateLineForm {
  gr_line_item_id: string;
  product_id: string;
  product_name: string;
  quantity_received: number;
  quantity_invoiced: string;
  unit_of_measure: string;
  unit_price: string;
  description: string;
}

export interface SupplierInvoiceCreateContext {
  goodsReceiptId: string;
  goodsReceiptNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  invoiceDate: string;
  dueDate: string;
  lines: SupplierInvoiceCreateLineForm[];
}

export interface SupplierInvoiceCreateSourceReceipt extends GoodsReceipt {
  line_items: GoodsReceiptLineItem[];
}
