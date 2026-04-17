// ──────────────────────────────────────────────
// Procurement – Shared primitives
// ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Timestamp {
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────
// Purchase Requisitions
// ──────────────────────────────────────────────

export type RequisitionStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Converted';

/** A single line item returned by the API (GET response shape). */
export interface RequisitionLineItem extends Timestamp {
  id: string;
  purchase_requisition: string;
  product: string;
  product_name: string;
  quantity: number | string;
  unit_of_measure: string;
  description: string;
}

/** Full purchase requisition returned by the API (GET response shape). */
export interface PurchaseRequisition extends Timestamp {
  id: string;
  pr_number: string;
  requested_by: string;
  requested_by_name: string;
  warehouse: string;
  warehouse_name: string;
  title: string;
  description: string;
  status: RequisitionStatus;

  submitted_by: string | null;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  converted_at: string | null;

  line_items: RequisitionLineItem[];
}

// ──────────────────────────────────────────────
// DTOs – POST / PUT / PATCH payloads
// ──────────────────────────────────────────────

/** A single line item in the POST/PUT request body. */
export interface CreateRequisitionLineDTO {
  product_id: string;
  quantity: string;
  unit_of_measure: string;
  description?: string;
}

/** POST body for creating a new requisition. */
export interface CreateRequisitionDTO {
  warehouse_id: string;
  title: string;
  description?: string;
  lines: CreateRequisitionLineDTO[];
}

/** PUT / PATCH body – partial updates. */
export type UpdateRequisitionDTO = Partial<CreateRequisitionDTO>;

// ──────────────────────────────────────────────
// Status-Action DTOs
// ──────────────────────────────────────────────

export interface SubmitRequisitionDTO {
  submitted_by: string;
}

export interface ApproveRequisitionDTO {
  approved_by: string;
}

export interface RejectRequisitionDTO {
  rejected_by: string;
  reason: string;
}

export interface ConvertLineDTO {
  pr_line_item_id: string;
  unit_price: string;
}

export interface ConvertRequisitionDTO {
  supplier_id: string;
  created_by: string;
  lines: ConvertLineDTO[];
}

// ──────────────────────────────────────────────
// Supplier
// ──────────────────────────────────────────────

export type SupplierType =
  | 'MANUFACTURER'
  | 'WHOLESALER'
  | 'DISTRIBUTOR'
  | 'RETAILER'
  | 'SERVICE_PROVIDER';

export type PaymentTerms =
  | 'NET_30'
  | 'NET_60'
  | 'COD'
  | 'EOM'
  | 'PREPAID'
  | 'IMMEDIATE';

export type DeliveryDay =
  | 'MON'
  | 'TUE'
  | 'WED'
  | 'THU'
  | 'FRI'
  | 'SAT'
  | 'SUN';

export type DeliveryMethod =
  | 'OWN_TRANSPORT'
  | 'THIRD_PARTY'
  | 'PICKUP';

export type DocumentType =
  | 'CONTRACT'
  | 'HEALTH_CERT'
  | 'TAX_CLEARANCE'
  | 'CERTIFICATION'
  | 'OTHER';

export type SupplierRating = 1 | 2 | 3 | 4 | 5;

export interface SupplierContact extends Timestamp {
  id: string;
  supplier: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  is_primary: boolean;
}

export interface SupplierDocument extends Timestamp {
  id: string;
  supplier: string;
  document_type: DocumentType;
  name: string;
  file_url: string;
  file_name: string;
  issued_date: string;
  expiry_date: string;
  notes: string;
  is_active: boolean;
}

export interface Supplier extends Timestamp {
  id: string;
  company: string;
  company_name: string;
  name: string;
  registration_number: string;
  tax_number: string;
  supplier_type: SupplierType;
  primary_email: string;
  secondary_email: string;
  primary_phone: string;
  alternate_phone: string;
  address: string;
  country: string;
  city: string;
  website: string;
  payment_terms: PaymentTerms;
  currency: string;
  credit_limit: number;
  bank_name: string;
  bank_branch: string;
  bank_account_number: string;
  can_supply_on_credit: boolean;
  default_lead_time_days: number;
  minimum_order_value: number;
  delivery_days: DeliveryDay[];
  delivery_method: DeliveryMethod;
  delivery_radius_km: number;
  warehouses_served: string[];
  rating: SupplierRating;
  internal_notes: string;
  on_hold: boolean;
  on_hold_reason: string;
  is_active: boolean;
  contacts: SupplierContact[];
  documents: SupplierDocument[];
}

export interface CreateSupplierDTO {
  company: string;
  name: string;
  registration_number?: string;
  tax_number?: string;
  supplier_type?: SupplierType;
  primary_email: string;
  secondary_email?: string;
  primary_phone: string;
  alternate_phone?: string;
  address?: string;
  country?: string;
  city?: string;
  website?: string;
  payment_terms?: PaymentTerms;
  currency: string;
  credit_limit?: string;
  bank_name?: string;
  bank_branch?: string;
  bank_account_number?: string;
  can_supply_on_credit?: boolean;
  default_lead_time_days?: number;
  minimum_order_value?: string;
  delivery_days?: DeliveryDay[];
  delivery_method?: DeliveryMethod;
  delivery_radius_km?: string;
  rating?: SupplierRating;
  internal_notes?: string;
  on_hold?: boolean;
  on_hold_reason?: string;
}

export type UpdateSupplierDTO = Partial<CreateSupplierDTO>;

// ──────────────────────────────────────────────
// Supplier Status-Action DTOs
// ──────────────────────────────────────────────

export interface AddProductToSupplierDTO {
  product_id: string;
  price: string;
  lead_time_days?: number;
  is_preferred?: boolean;
}

export interface PutOnHoldDTO {
  reason: string;
}

// ──────────────────────────────────────────────
// Supplier Product (response from add-product)
// ──────────────────────────────────────────────

export interface SupplierProduct extends Timestamp {
  id: string;
  supplier: string;
  product_id: string;
  price: number;
  lead_time_days: number;
  is_preferred: boolean;
}

// ──────────────────────────────────────────────
// Contact DTOs
// ──────────────────────────────────────────────

export interface CreateContactDTO {
  supplier: string;
  name: string;
  role?: string;
  email: string;
  phone: string;
  is_primary?: boolean;
}

export type UpdateContactDTO = Partial<CreateContactDTO>;

// ──────────────────────────────────────────────
// Document DTOs
// ──────────────────────────────────────────────

export interface CreateDocumentDTO {
  supplier: string;
  document_type: DocumentType;
  name: string;
  file_url?: string;
  file_name?: string;
  issued_date?: string;
  expiry_date?: string;
  notes?: string;
  is_active?: boolean;
}

export type UpdateDocumentDTO = Partial<CreateDocumentDTO>;
