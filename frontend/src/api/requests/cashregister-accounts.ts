import type {
  CashregisterAccountsResponse,
  createCashregisterAccountsParams,
  editCashregisterAccountsParams,
  getCashregisterAccountsParams,
  removeCashregisterAccountsParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getCashregisterAccounts(params: getCashregisterAccountsParams) {
  return api.get<CashregisterAccountsResponse>('cashregister-accounts/get', { params })
}

export async function createCashregisterAccount(params: createCashregisterAccountsParams) {
  return api.post<CashregisterAccountsResponse>('cashregister-accounts/create', { ...params })
}

export async function editCashregisterAccount(params: editCashregisterAccountsParams) {
  return api.post<CashregisterAccountsResponse>('cashregister-accounts/edit', params)
}

export async function removeCashregisterAccount(params: removeCashregisterAccountsParams) {
  return api.post<CashregisterAccountsResponse>('cashregister-accounts/remove', params)
}
