import { cogsApi } from '../api/cogs_client';
import type { CogsPostingResult, PostCogsDTO } from '../types/cogs_models';

// ──────────────────────────────────────────────
// COGS Posting Service
// ──────────────────────────────────────────────

export const cogsService = {
  async post(dto: PostCogsDTO): Promise<CogsPostingResult> {
    if (!dto.sales_order_id) throw new Error('Sales Order ID is required');
    return cogsApi.post(dto);
  },
};
