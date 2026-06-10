import type {
  CreateBalanceRequest,
  CreateBalanceResponse,
  GetBalanceRequest,
  GetBalancesResponse,
  GetCurrentBalanceRequest,
  GetCurrentBalanceResponse,
  RemoveBalanceRequest,
  RemoveBalancesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getBalances(params: GetBalanceRequest) {
  return api.get<GetBalancesResponse>('balance/get', { params })
}

export async function getCurrentBalance(params: GetCurrentBalanceRequest) {
  return api.get<GetCurrentBalanceResponse>('balance/get-current', { params })
}

export async function createBalance(params: CreateBalanceRequest) {
  return api.post<CreateBalanceResponse>('balance/create', { ...params })
}

export async function removeBalance(params: RemoveBalanceRequest) {
  return api.post<RemoveBalancesResponse>('balance/remove', { ...params })
}
