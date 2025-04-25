import { api } from '@/api/instance'

export interface GetProductsParams {
  // filters: {
  //   current: number;
  //   pageSize: number;
  // };
  // sorters: {
  //   current: number;
  //   pageSize: number;
  // };
  pagination: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export async function getProducts(params: GetProductsParams) {
  return api.post<ProductsResponse>('products/get', { params })
}

export type createProductParams = Product

export async function createProduct(params: createProductParams) {
  return api.post<ProductsResponse>('products/create', { ...params })
}

export type editProductParams = Product

export async function editProduct(params: editProductParams) {
  return api.post<ProductsResponse>('products/edit', params)
}

export interface removeProductParams {
  _id: string
}

export async function removeProduct(params: removeProductParams) {
  return api.post<ProductsResponse>('products/remove', params)
}
