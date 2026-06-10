import type {
  BatchProductRequest,
  BatchProductResponse,
  CreateProductRequest,
  CreateProductResponse,
  EditProductRequest,
  EditProductResponse,
  ExportProductsRequest,
  GetProductRequest,
  GetProductsResponse,
  ImportProductsRequest,
  ImportProductsResponse,
  RemoveProductRequest,
  RemoveProductResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getProducts(params: GetProductRequest) {
  return api.get<GetProductsResponse>('products/get', { params })
}

export async function createProduct(params: CreateProductRequest) {
  return api.post<CreateProductResponse>('products/create', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function editProduct(params: EditProductRequest) {
  return api.post<EditProductResponse>('products/edit', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function removeProduct(params: RemoveProductRequest) {
  return api.post<RemoveProductResponse>('products/remove', params)
}

export async function batchProduct(params: BatchProductRequest) {
  return api.post<BatchProductResponse>('products/batch', params)
}

export async function importProducts(params: ImportProductsRequest) {
  return api.post<ImportProductsResponse>('products/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function exportProducts(params: ExportProductsRequest) {
  return api.post<Blob>('products/export', params, {
    responseType: 'blob',
  })
}

export async function downloadTemplate() {
  return api.get<Blob>('products/download-template', {
    responseType: 'blob',
  })
}
