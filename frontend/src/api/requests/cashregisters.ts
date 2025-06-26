import type {
  CashregistersResponse,
  createCashregistersParams,
  editCashregistersParams,
  getCashregistersParams,
  removeCashregistersParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getCashregisters(params: getCashregistersParams) {
  return api.get<CashregistersResponse>('cashregisters/get', { params })
}

export async function createCashregister(params: createCashregistersParams) {
  return api.post<CashregistersResponse>('cashregisters/create', { ...params })
}

export async function editCashregister(params: editCashregistersParams) {
  return api.post<CashregistersResponse>('cashregisters/edit', params)
}

export async function removeCashregister(params: removeCashregistersParams) {
  return api.post<CashregistersResponse>('cashregisters/remove', params)
}
