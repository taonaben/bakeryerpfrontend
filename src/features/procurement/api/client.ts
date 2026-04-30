import apiClient from '@/shared/services/api';
import type {
  PaginatedResponse,
  PurchaseRequisition,
  CreateRequisitionDTO,
  CreateAndSubmitRequisitionDTO,
  UpdateRequisitionDTO,
  SubmitRequisitionDTO,
  ApproveRequisitionDTO,
  RejectRequisitionDTO,
  ConvertRequisitionDTO,
  Supplier,
} from '../types/models';

// Raw API calls — no caching, no state
export const requisitionApi = {
  /** GET /purchasing/purchase-requisitions/ */
  getRequisitions: async (
    params: Record<string, any>,
  ): Promise<PaginatedResponse<PurchaseRequisition>> => {
    const { data } = await apiClient.get('/purchasing/purchase-requisitions/', { params });
    return data;
  },

  /** GET /purchasing/purchase-requisitions/:id/ */
  getRequisition: async (id: string): Promise<PurchaseRequisition> => {
    const { data } = await apiClient.get(`/purchasing/purchase-requisitions/${id}/`);
    return data;
  },

  /** POST /purchasing/purchase-requisitions/ */
  createRequisition: async (dto: CreateRequisitionDTO): Promise<PurchaseRequisition> => {
    const { data } = await apiClient.post('/purchasing/purchase-requisitions/', dto);
    return data;
  },

  /**
   * POST /purchasing/purchase-requisitions/create-and-submit/
   * Atomic create + submit — returns a Submitted requisition in one request.
   */
  createAndSubmitRequisition: async (
    dto: CreateAndSubmitRequisitionDTO,
  ): Promise<PurchaseRequisition> => {
    const { data } = await apiClient.post(
      '/purchasing/purchase-requisitions/create-and-submit/',
      dto,
    );
    return data;
  },

  /** PUT /purchasing/purchase-requisitions/:id/ */
  updateRequisition: async (
    id: string,
    dto: UpdateRequisitionDTO,
  ): Promise<PurchaseRequisition> => {
    const { data } = await apiClient.put(`/purchasing/purchase-requisitions/${id}/`, dto);
    return data;
  },

  /** PATCH /purchasing/purchase-requisitions/:id/ */
  patchRequisition: async (
    id: string,
    dto: Partial<UpdateRequisitionDTO>,
  ): Promise<PurchaseRequisition> => {
    const { data } = await apiClient.patch(`/purchasing/purchase-requisitions/${id}/`, dto);
    return data;
  },

  /** DELETE /purchasing/purchase-requisitions/:id/ */
  deleteRequisition: async (id: string): Promise<void> => {
    await apiClient.delete(`/purchasing/purchase-requisitions/${id}/`);
  },

  // ─── Status Actions ─────────────────────────

  /** POST /purchasing/purchase-requisitions/:id/submit/ */
  submitRequisition: async (id: string, dto: SubmitRequisitionDTO): Promise<PurchaseRequisition> => {
    const { data } = await apiClient.post(`/purchasing/purchase-requisitions/${id}/submit/`, dto);
    return data;
  },

  /** POST /purchasing/purchase-requisitions/:id/approve/ */
  approveRequisition: async (id: string, dto: ApproveRequisitionDTO): Promise<PurchaseRequisition> => {
    const { data } = await apiClient.post(`/purchasing/purchase-requisitions/${id}/approve/`, dto);
    return data;
  },

  /** POST /purchasing/purchase-requisitions/:id/reject/ */
  rejectRequisition: async (id: string, dto: RejectRequisitionDTO): Promise<PurchaseRequisition> => {
    const { data } = await apiClient.post(`/purchasing/purchase-requisitions/${id}/reject/`, dto);
    return data;
  },

  /** POST /purchasing/purchase-requisitions/:id/convert/ */
  convertRequisition: async (id: string, dto: ConvertRequisitionDTO): Promise<any> => {
    const { data } = await apiClient.post(`/purchasing/purchase-requisitions/${id}/convert/`, dto);
    return data;
  },
};

// ──────────────────────────────────────────────
// Supplier API (minimal — for convert page)
// ──────────────────────────────────────────────

export const supplierApi = {
  /** GET /purchasing/suppliers/ */
  getSuppliers: async (params?: Record<string, any>): Promise<PaginatedResponse<Supplier>> => {
    const { data } = await apiClient.get('/purchasing/suppliers/', { params });
    return data;
  },
};
