import type {
  CreateCashregisterRequest,
  CreateCashregisterResponse,
  EditCashregisterRequest,
  EditCashregisterResponse,
  GetCashregistersRequest,
  GetCashregistersResponse,
  RemoveCashregistersRequest,
  RemoveCashregistersResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getCashregisters(params: GetCashregistersRequest) {
  return api.get<GetCashregistersResponse>('cashregisters/get', { params })
}

export async function createCashregister(params: CreateCashregisterRequest) {
  return api.post<CreateCashregisterResponse>('cashregisters/create', { ...params })
}

export async function editCashregister(params: EditCashregisterRequest) {
  return api.post<EditCashregisterResponse>('cashregisters/edit', params)
}

export async function removeCashregister(params: RemoveCashregistersRequest) {
  return api.post<RemoveCashregistersResponse>('cashregisters/remove', params)
}
