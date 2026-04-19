import type { PurchaseRequisition, UpdateRequisitionDTO, Supplier, UpdateSupplierDTO, AddProductToSupplierDTO, CreateContactDTO, UpdateContactDTO, CreateDocumentDTO, UpdateDocumentDTO } from './models';
import type { PurchaseOrder, UpdatePurchaseOrderDTO } from './purchase_orders_models';

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
