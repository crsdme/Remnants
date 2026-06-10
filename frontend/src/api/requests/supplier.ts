import type {
  CreateSupplierRequest,
  CreateSupplierResponse,
  EditSupplierRequest,
  EditSupplierResponse,
  GetSuppliersRequest,
  GetSuppliersResponse,
  RemoveSuppliersRequest,
  RemoveSuppliersResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getSuppliers(params: GetSuppliersRequest) {
  return api.get<GetSuppliersResponse>('suppliers/get', { params })
}

export async function createSupplier(params: CreateSupplierRequest) {
  return api.post<CreateSupplierResponse>('suppliers/create', { ...params })
}

export async function editSupplier(params: EditSupplierRequest) {
  return api.post<EditSupplierResponse>('suppliers/edit', params)
}

export async function removeSupplier(params: RemoveSuppliersRequest) {
  return api.post<RemoveSuppliersResponse>('suppliers/remove', params)
}
