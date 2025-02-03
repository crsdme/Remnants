import { api } from '@/utils/api/instance';

export type GetProductsParams = {
  filters?: [];
  sorters?: [];
  pagination?: [];
};

export const getProducts = async ({ params }) =>
  api.post<ProductsResponse>('products/get', { params });
