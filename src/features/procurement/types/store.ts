import type { PurchaseRequisition, UpdateRequisitionDTO, Supplier, UpdateSupplierDTO, AddProductToSupplierDTO, CreateContactDTO, UpdateContactDTO, CreateDocumentDTO, UpdateDocumentDTO, SupplierProduct, SupplierProductQueryParams, CreateSupplierProductDTO, UpdateSupplierProductDTO } from './models';
import type { PurchaseOrder, UpdatePurchaseOrderDTO } from './purchase_orders_models';
import type { GoodsReceipt, UpdateGoodsReceiptDTO, GoodsReceiptListFilters } from './grn_models';
import type {
  SupplierInvoice,
  UpdateSupplierInvoiceDTO,
  SupplierInvoiceListFilters,
  SupplierInvoiceMatchResult,
} from './supplier_invoices_model';

// ──────────────────────────────────────────────
// Cache metadata (shared by all detail stores)
// ──────────────────────────────────────────────

export interface CacheMetadata {
  lastFetched: number | null;
  ttl: number;
  isFetching: boolean;
}

// ──────────────────────────────────────────────
// Requisition Detail Store State
// ──────────────────────────────────────────────

export interface RequisitionDetailState {
  // Main data
  requisition: PurchaseRequisition | null;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  isApproving: boolean;
  isRejecting: boolean;

  // Error states
  error: string | null;
  updateError: string | null;

  // Cache
  cache: CacheMetadata;

  // Actions
  fetchRequisition: (id: string) => Promise<void>;
  updateRequisition: (id: string, data: UpdateRequisitionDTO) => Promise<void>;
  deleteRequisition: (id: string) => Promise<void>;
  submitRequisition: (id: string) => Promise<void>;
  approveRequisition: (id: string) => Promise<void>;
  rejectRequisition: (id: string, reason: string) => Promise<void>;
  clearRequisition: () => void;
  setError: (error: string | null) => void;
}

// ──────────────────────────────────────────────
// Supplier Detail Store State
// ──────────────────────────────────────────────

export interface SupplierDetailState {
  // Main data
  supplier: Supplier | null;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isPuttingOnHold: boolean;
  isReleasingHold: boolean;
  isReactivating: boolean;
  isAddingProduct: boolean;
  isContactLoading: boolean;
  isDocumentLoading: boolean;

  // Error states
  error: string | null;
  updateError: string | null;

  // Cache
  cache: CacheMetadata;

  // Core CRUD
  fetchSupplier: (id: string) => Promise<void>;
  updateSupplier: (id: string, data: UpdateSupplierDTO) => Promise<void>;
  patchSupplier: (id: string, data: Partial<UpdateSupplierDTO>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  clearSupplier: () => void;
  setError: (error: string | null) => void;

  // Status actions
  putOnHold: (id: string, reason: string) => Promise<void>;
  releaseHold: (id: string) => Promise<void>;
  reactivate: (id: string) => Promise<void>;
  addProduct: (id: string, dto: AddProductToSupplierDTO) => Promise<void>;

  // Contacts
  createContact: (supplierId: string, dto: CreateContactDTO) => Promise<void>;
  updateContact: (supplierId: string, contactId: string, dto: UpdateContactDTO) => Promise<void>;
  patchContact: (supplierId: string, contactId: string, dto: Partial<UpdateContactDTO>) => Promise<void>;
  deleteContact: (supplierId: string, contactId: string) => Promise<void>;

  // Documents
  createDocument: (supplierId: string, dto: CreateDocumentDTO) => Promise<void>;
  updateDocument: (supplierId: string, documentId: string, dto: UpdateDocumentDTO) => Promise<void>;
  patchDocument: (supplierId: string, documentId: string, dto: Partial<UpdateDocumentDTO>) => Promise<void>;
  deleteDocument: (supplierId: string, documentId: string) => Promise<void>;
}

// ──────────────────────────────────────────────
// Purchase Order Detail Store State
// ──────────────────────────────────────────────

export interface PurchaseOrderDetailState {
  // Main data
  purchaseOrder: PurchaseOrder | null;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  isCancelling: boolean;

  // Error states
  error: string | null;
  updateError: string | null;

  // Cache
  cache: CacheMetadata;

  // Actions
  fetchOrder: (id: string) => Promise<void>;
  updateOrder: (id: string, data: UpdatePurchaseOrderDTO) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  submitOrder: (id: string) => Promise<void>;
  approveOrder: (id: string) => Promise<void>;
  rejectOrder: (id: string, reason: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  clearOrder: () => void;
  setError: (error: string | null) => void;
}

// ──────────────────────────────────────────────
// Goods Receipt Detail Store State
// ──────────────────────────────────────────────

export interface GoodsReceiptDetailState {
  // Main data
  goodsReceipt: GoodsReceipt | null;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isConfirming: boolean;
  isRejecting: boolean;

  // Error states
  error: string | null;
  updateError: string | null;

  // Cache
  cache: CacheMetadata;

  // Actions
  fetchReceipt: (id: string) => Promise<void>;
  updateReceipt: (id: string, data: UpdateGoodsReceiptDTO) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  confirmReceipt: (id: string) => Promise<void>;
  rejectReceipt: (id: string, reason: string) => Promise<void>;
  clearReceipt: () => void;
  setError: (error: string | null) => void;
}

// ──────────────────────────────────────────────
// Goods Receipt List Store State
// ──────────────────────────────────────────────

export interface GoodsReceiptListState {
  receipts: GoodsReceipt[];
  count: number;
  currentPage: number;
  totalPages: number;
  filters: GoodsReceiptListFilters;

  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  cache: CacheMetadata;
  refreshToken: number;

  fetchReceipts: (force?: boolean) => Promise<void>;
  setFilters: (partial: Partial<GoodsReceiptListFilters>) => Promise<void>;
  clearFilters: () => Promise<void>;
  setPage: (page: number) => Promise<void>;
  refresh: () => Promise<void>;
  invalidateCache: () => void;
  notifyMutation: () => void;
  setError: (error: string | null) => void;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Supplier Invoice Detail Store State
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SupplierInvoiceDetailState {
  supplierInvoice: SupplierInvoice | null;
  matchResult: SupplierInvoiceMatchResult | null;

  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  isMarkingPaid: boolean;
  isMatching: boolean;

  error: string | null;
  updateError: string | null;
  matchError: string | null;

  cache: CacheMetadata;

  fetchInvoice: (id: string) => Promise<void>;
  updateInvoice: (id: string, data: UpdateSupplierInvoiceDTO) => Promise<void>;
  patchInvoice: (id: string, data: Partial<UpdateSupplierInvoiceDTO>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  approveInvoice: (id: string) => Promise<void>;
  rejectInvoice: (id: string, reason: string) => Promise<void>;
  markInvoicePaid: (id: string, paymentReference: string) => Promise<void>;
  fetchMatch: (id: string, force?: boolean) => Promise<void>;
  clearInvoice: () => void;
  clearMatch: () => void;
  setError: (error: string | null) => void;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Supplier Invoice List Store State
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SupplierInvoiceListState {
  invoices: SupplierInvoice[];
  count: number;
  currentPage: number;
  totalPages: number;
  filters: SupplierInvoiceListFilters;

  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  cache: CacheMetadata;
  refreshToken: number;

  fetchInvoices: (force?: boolean) => Promise<void>;
  setFilters: (partial: Partial<SupplierInvoiceListFilters>) => Promise<void>;
  clearFilters: () => Promise<void>;
  setPage: (page: number) => Promise<void>;
  refresh: () => Promise<void>;
  invalidateCache: () => void;
  notifyMutation: () => void;
  setError: (error: string | null) => void;
}

// ──────────────────────────────────────────────
// Supplier Products Store State
// ──────────────────────────────────────────────

export interface SupplierProductsState {
  /** Flat list of supplier-product links for the current query */
  items: SupplierProduct[];

  /** The active query params used for the last fetch */
  queryParams: SupplierProductQueryParams;

  /** Single record being viewed/edited */
  selected: SupplierProduct | null;

  isLoading: boolean;
  isSaving: boolean;
  isDeactivating: boolean;
  error: string | null;

  /** Fetch list — requires at least product_id or supplier_id */
  fetchSupplierProducts: (params: SupplierProductQueryParams) => Promise<void>;

  /** Fetch a single record by its own ID */
  fetchSupplierProduct: (id: string) => Promise<void>;

  /** Add a supplier to a product's catalogue */
  createSupplierProduct: (productId: string, dto: CreateSupplierProductDTO) => Promise<SupplierProduct>;

  /** Update price, lead time, preferred flag, or active flag */
  updateSupplierProduct: (id: string, dto: UpdateSupplierProductDTO) => Promise<SupplierProduct>;

  /** Soft-deactivate a supplier-product link */
  deactivateSupplierProduct: (id: string) => Promise<SupplierProduct>;

  /** Clear list and selected record */
  clearSupplierProducts: () => void;
}
