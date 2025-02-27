import { api } from '@/api/instance';

export type GetProductsParams = {
  // filters: {
  //   current: number;
  //   pageSize: number;
  // };
  // sorters: {
  //   current: number;
  //   pageSize: number;
  // };
  pagination: {
    full?: boolean;
    current?: number;
    pageSize?: number;
  };
};

export const getProducts = async (params: GetProductsParams) =>
  api.post<ProductsResponse>('products/get', { params });

export type createProductParams = Product;

export const createProduct = async (params: createProductParams) =>
  api.post<ProductsResponse>('products/create', { ...params });

export type editProductParams = Product;

export const editProduct = async (params: editProductParams) =>
  api.post<ProductsResponse>('products/edit', params);

export type removeProductParams = {
  _id: string;
};

export const removeProduct = async (params: removeProductParams) =>
  api.post<ProductsResponse>('products/remove', params);
