import { requisitionApi, supplierApi } from '../api/client';
import { useUserStore } from '../../auth/stores/userStore';
import type {
  PurchaseRequisition,
  RequisitionLineItem,
  CreateRequisitionDTO,
  UpdateRequisitionDTO,
  ConvertRequisitionDTO,
  Supplier,
} from '../types/models';

// ──────────────────────────────────────────────
// Requisition Service
// Validation → API call → Normalisation
// ──────────────────────────────────────────────

export const requisitionService = {
  // ─── List ────────────────────────────────────
  async fetchRequisitions(
    filterParams?: Record<string, any>,
    page: number = 1,
  ): Promise<{
    data: PurchaseRequisition[];
    count: number;
    currentPage: number;
    totalPages: number;
  }> {
    const apiParams: Record<string, any> = {};

    if (filterParams && typeof filterParams === 'object') {
      Object.entries(filterParams).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          apiParams[key] = value;
        }
      });
    } else {
      apiParams.page = page;
    }

    const response = await requisitionApi.getRequisitions(apiParams);
    const pageSize = apiParams.page_size || 25;
    const totalPages = Math.ceil(response.count / pageSize);

    return {
      data: response.results.map((r) => this.normalizeRequisition(r)),
      count: response.count,
      currentPage: apiParams.page || 1,
      totalPages,
    };
  },

  // ─── Detail ──────────────────────────────────
  async fetchRequisition(id: string): Promise<PurchaseRequisition> {
    if (!id) throw new Error('Requisition ID is required');
    const raw = await requisitionApi.getRequisition(id);
    return this.normalizeRequisition(raw);
  },

  // ─── Create ──────────────────────────────────
  async createRequisition(dto: CreateRequisitionDTO): Promise<PurchaseRequisition> {
    this.validateRequisition(dto);
    const created = await requisitionApi.createRequisition(dto);
    return this.normalizeRequisition(created);
  },

  // ─── Create & Submit (atomic) ────────────────
  async createAndSubmitRequisition(dto: CreateRequisitionDTO): Promise<PurchaseRequisition> {
    this.validateRequisition(dto);
    const created = await requisitionApi.createAndSubmitRequisition({
      ...dto,
      submitted_by: this._getCurrentUserId(),
    });
    return this.normalizeRequisition(created);
  },

  // ─── Full Update (PUT) ──────────────────────
  async updateRequisition(
    id: string,
    dto: UpdateRequisitionDTO,
  ): Promise<PurchaseRequisition> {
    if (!id) throw new Error('Requisition ID is required');
    const updated = await requisitionApi.patchRequisition(id, dto);
    return this.normalizeRequisition(updated);
  },

  // ─── Partial Update (PATCH) ─────────────────
  async patchRequisition(
    id: string,
    dto: Partial<UpdateRequisitionDTO>,
  ): Promise<PurchaseRequisition> {
    if (!id) throw new Error('Requisition ID is required');
    const updated = await requisitionApi.patchRequisition(id, dto);
    return this.normalizeRequisition(updated);
  },

  // ─── Delete ──────────────────────────────────
  async deleteRequisition(id: string): Promise<void> {
    if (!id) throw new Error('Requisition ID is required');
    await requisitionApi.deleteRequisition(id);
  },

  // ─── Normalisation ──────────────────────────
  normalizeRequisition(raw: any): PurchaseRequisition {
    return {
      ...raw,
      status: raw.status || 'Draft',
      line_items: Array.isArray(raw.line_items)
        ? raw.line_items.map((li: any) => this.normalizeLineItem(li))
        : [],
      submitted_by: raw.submitted_by ?? null,
      submitted_at: raw.submitted_at ?? null,
      approved_by: raw.approved_by ?? null,
      approved_at: raw.approved_at ?? null,
      rejected_by: raw.rejected_by ?? null,
      rejected_at: raw.rejected_at ?? null,
      rejection_reason: raw.rejection_reason ?? null,
      converted_at: raw.converted_at ?? null,
    };
  },

  normalizeLineItem(raw: any): RequisitionLineItem {
    return {
      ...raw,
      quantity: parseFloat(raw.quantity) || 0,
      unit_of_measure: raw.unit_of_measure || '',
      description: raw.description || '',
    };
  },

  // ─── Validation ─────────────────────────────
  validateRequisition(dto: CreateRequisitionDTO): void {
    if (!dto.warehouse_id) throw new Error('Warehouse is required');
    if (!dto.title?.trim()) throw new Error('Title is required');
    if (!Array.isArray(dto.lines) || dto.lines.length === 0) {
      throw new Error('At least one line item is required');
    }
    dto.lines.forEach((line, i) => {
      if (!line.product_id) throw new Error(`Line ${i + 1}: Product is required`);
      if (!line.quantity || parseFloat(line.quantity) <= 0) {
        throw new Error(`Line ${i + 1}: Valid quantity is required`);
      }
    });
  },

  // ─── Status Actions ─────────────────────────

  /** Get the current authenticated user's ID */
  _getCurrentUserId(): string {
    // Try Zustand store first
    const storeUser = useUserStore.getState().user;
    if (storeUser?.id) return storeUser.id;

    // Fallback to localStorage (store isn't populated on page refresh)
    const saved = localStorage.getItem('erp_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed.id;
      } catch {
        // ignore parse errors
      }
    }

    throw new Error('You must be logged in to perform this action');
  },

  /** Submit a draft requisition for approval */
  async submitRequisition(id: string): Promise<PurchaseRequisition> {
    if (!id) throw new Error('Requisition ID is required');
    const result = await requisitionApi.submitRequisition(id, {
      submitted_by: this._getCurrentUserId(),
    });
    return this.normalizeRequisition(result);
  },

  /** Approve a submitted requisition */
  async approveRequisition(id: string): Promise<PurchaseRequisition> {
    if (!id) throw new Error('Requisition ID is required');
    const result = await requisitionApi.approveRequisition(id, {
      approved_by: this._getCurrentUserId(),
    });
    return this.normalizeRequisition(result);
  },

  /** Reject a submitted requisition */
  async rejectRequisition(id: string, reason: string): Promise<PurchaseRequisition> {
    if (!id) throw new Error('Requisition ID is required');
    if (!reason?.trim()) throw new Error('Rejection reason is required');
    const result = await requisitionApi.rejectRequisition(id, {
      rejected_by: this._getCurrentUserId(),
      reason: reason.trim(),
    });
    return this.normalizeRequisition(result);
  },

  /** Convert an approved requisition to a purchase order */
  async convertRequisition(id: string, dto: ConvertRequisitionDTO): Promise<any> {
    if (!id) throw new Error('Requisition ID is required');
    if (!dto.supplier_id) throw new Error('Supplier is required');
    if (!dto.lines || dto.lines.length === 0) throw new Error('At least one line item is required');
    return requisitionApi.convertRequisition(id, {
      ...dto,
      created_by: this._getCurrentUserId(),
    });
  },

  // ─── Supplier ───────────────────────────────

  /** Fetch suppliers for dropdown */
  async fetchSuppliers(): Promise<Supplier[]> {
    const response = await supplierApi.getSuppliers({ page_size: 200 });
    return response.results;
  },
};
