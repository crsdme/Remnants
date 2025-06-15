import { api } from '@/api/instance'

export interface getProductsParams {
  filters: {
    names?: string
    language: string
    active?: boolean[]
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
    updatedAt?: {
      from?: Date
      to?: Date
    }
  }
  sorters?: {
    names?: string
    priority?: string
    createdAt?: string
    updatedAt?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
  isTree?: boolean
}

export async function getProducts(params: getProductsParams) {
  return api.get<ProductsResponse>('products/get', { params })
}

export interface createProductsParams extends FormData {}

export async function createProduct(params: createProductsParams) {
  return api.post<ProductsResponse>('products/create', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export interface editProductParams extends FormData {}

export async function editProduct(params: editProductParams) {
  return api.post<ProductsResponse>('products/edit', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export interface removeProductParams {
  ids: string[]
}

export async function removeProduct(params: removeProductParams) {
  return api.post<ProductsResponse>('products/remove', params)
}

interface batchItem {
  id: string
  column: string
  value: string | number | boolean | Record<string, string>
}

interface batchFilterItem {
  filters?: {
    names?: string
    symbols?: string
    language: string
    active?: boolean[]
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
  }
}

export interface batchProductParams {
  ids: string[]
  params: batchItem[]
  filters: batchFilterItem[]
}

export async function batchProduct(params: batchProductParams) {
  return api.post<ProductsResponse>('products/batch', params)
}

export interface importProductsParams {
  file: File
}

export async function importProducts(params: importProductsParams) {
  return api.post<ProductsResponse>('products/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export interface duplicateProductParams {
  ids: string[]
}

export async function duplicateProduct(params: duplicateProductParams) {
  return api.post<ProductsResponse>('products/duplicate', params)
}

export interface exportProductsParams {
  ids: string[]
}

export async function exportProducts(params: exportProductsParams) {
  return api.post<Blob>('products/export', params, {
    responseType: 'blob',
  })
}
