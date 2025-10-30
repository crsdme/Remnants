import type {
  createSupplierParams,
  editSupplierParams,
  getSuppliersParams,
  removeSuppliersParams,
  SupplierResponse,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getSuppliers(params: getSuppliersParams) {
  return api.get<SupplierResponse>('suppliers/get', { params })
}

export async function createSupplier(params: createSupplierParams) {
  return api.post<SupplierResponse>('suppliers/create', { ...params })
}

export async function editSupplier(params: editSupplierParams) {
  return api.post<SupplierResponse>('suppliers/edit', params)
}

export async function removeSupplier(params: removeSuppliersParams) {
  return api.post<SupplierResponse>('suppliers/remove', params)
}
