import { productsApi } from '../api/products';
import type {
  CreateProductDTO,
  Product,
  UpdateProductDTO,
} from '../types/productModel';

export const productService = {
  async fetchProducts(params: Record<string, any>) {
    const response = await productsApi.getProducts(params);
    const pageSize = Number(params.page_size || 25);
    const currentPage = Number(params.page || 1);
    const totalPages = Math.max(1, Math.ceil(response.count / pageSize));
    return {
      data: response.results,
      count: response.count,
      currentPage,
      totalPages,
    };
  },

  async getProduct(id: string): Promise<Product> {
    return productsApi.getProduct(id);
  },

  async createProduct(payload: CreateProductDTO): Promise<Product> {
    return productsApi.createProduct(payload);
  },

  async updateProduct(id: string, payload: UpdateProductDTO): Promise<Product> {
    return productsApi.updateProduct(id, payload);
  },

  async deleteProduct(id: string): Promise<void> {
    return productsApi.deleteProduct(id);
  },
};
