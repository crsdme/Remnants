import type {
  createBalanceParams,
  createBalanceResponse,
  getBalancesParams,
  getBalancesResponse,
  getCurrentBalanceParams,
  getCurrentBalanceResponse,
  removeBalancesParams,
  removeBalancesResponse,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getBalances(params: getBalancesParams) {
  return api.get<getBalancesResponse>('balance/get', { params })
}

export async function getCurrentBalance(params: getCurrentBalanceParams) {
  return api.get<getCurrentBalanceResponse>('balance/get-current', { params })
}

export async function createBalance(params: createBalanceParams) {
  return api.post<createBalanceResponse>('balance/create', { ...params })
}

export async function removeBalance(params: removeBalancesParams) {
  return api.post<removeBalancesResponse>('balance/remove', { ...params })
}
