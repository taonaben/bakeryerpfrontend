import apiClient from '@/shared/services/api';
import type {
  CreateProductDTO,
  PaginatedProductResponse,
  Product,
  UpdateProductDTO,
} from '../types/productModel';

const toPaginated = (data: any): PaginatedProductResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }
  return data;
};

export const productsApi = {
  async getProducts(params: Record<string, any>): Promise<PaginatedProductResponse> {
    const { data } = await apiClient.get('/products', { params });
    return toPaginated(data);
  },

  async getProduct(id: string): Promise<Product> {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  async createProduct(payload: CreateProductDTO): Promise<Product> {
    console.log('Sending product payload:', payload);
    const { data } = await apiClient.post('/products', payload);
    return data;
  },

  async updateProduct(id: string, payload: UpdateProductDTO): Promise<Product> {
    const { data } = await apiClient.patch(`/products/${id}`, payload);
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
