import apiClient from '@/shared/services/api';
import type { product, productDTO } from '../types/models';

export const productService = {
    async getProducts(): Promise<product[]> {
        const response = await apiClient.get<product[]>('/products');
        const data = response.data as any;
        return data.results || data;
    },

    async getProduct(product_id: string): Promise<product> {
        const response = await apiClient.get<product>(`/products/${product_id}`);
        return response.data;
    },
    async createProduct(productData: productDTO): Promise<product> {
        const response = await apiClient.post<product>('/products', productData);
        return response.data;
    }
};