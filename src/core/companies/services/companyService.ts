import apiClient from '@/shared/services/api';
import type { Company } from '../types/models';

/**
 * COMPANY SERVICE
 * 
 * Handles company-related API calls.
 */

export const companyService = {
  /**
   * Get all companies for the authenticated user
   * Should return the company the user belongs to
   */
  async getCompanies(): Promise<Company[]> {
    const response = await apiClient.get<Company[]>('/companies');
    return response.data;
  },

  /**
   * Get a specific company by ID
   */
  async getCompany(company_id: string): Promise<Company> {
    const response = await apiClient.get<Company>(`/companies/${company_id}`);
    return response.data;
  },

  /**
   * Get warehouses for a specific company
   */
  async getCompanyWarehouses(company_id: string) {
    const response = await apiClient.get(`/companies/${company_id}/warehouses`);
    return response.data.results || response.data;
  },
};
