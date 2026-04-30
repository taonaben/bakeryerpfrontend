import apiClient from '@/shared/services/api';
import type { CogsPostingResult, PostCogsDTO } from '../types/cogs_models';

export const cogsApi = {
  post: async (dto: PostCogsDTO): Promise<CogsPostingResult> => {
    const { data } = await apiClient.post('/costing/cogs/post', dto);
    return data;
  },
};
