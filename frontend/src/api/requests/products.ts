import type {
  batchProductParams,
  createProductsParams,
  duplicateProductParams,
  editProductParams,
  exportProductsParams,
  getProductsParams,
  importProductsParams,
  ProductsResponse,
  removeProductParams,
} from '@/api/types/products'
import { api } from '@/api/instance'

export async function getProducts(params: getProductsParams) {
  return api.get<ProductsResponse>('products/get', { params })
}

export async function createProduct(params: createProductsParams) {
  return api.post<ProductsResponse>('products/create', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function editProduct(params: editProductParams) {
  return api.post<ProductsResponse>('products/edit', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function removeProduct(params: removeProductParams) {
  return api.post<ProductsResponse>('products/remove', params)
}

export async function batchProduct(params: batchProductParams) {
  return api.post<ProductsResponse>('products/batch', params)
}

export async function importProducts(params: importProductsParams) {
  return api.post<ProductsResponse>('products/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function duplicateProduct(params: duplicateProductParams) {
  return api.post<ProductsResponse>('products/duplicate', params)
}

export async function exportProducts(params: exportProductsParams) {
  return api.post<Blob>('products/export', params, {
    responseType: 'blob',
  })
}
