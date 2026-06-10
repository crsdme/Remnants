import type {
  CreateCashregisterAccountRequest,
  CreateCashregisterAccountResponse,
  EditCashregisterAccountRequest,
  EditCashregisterAccountResponse,
  GetCashregisterAccountsRequest,
  GetCashregisterAccountsResponse,
  RemoveCashregisterAccountsRequest,
  RemoveCashregisterAccountsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getCashregisterAccounts(params: GetCashregisterAccountsRequest) {
  return api.get<GetCashregisterAccountsResponse>('cashregister-accounts/get', { params })
}

export async function createCashregisterAccount(params: CreateCashregisterAccountRequest) {
  return api.post<CreateCashregisterAccountResponse>('cashregister-accounts/create', { ...params })
}

export async function editCashregisterAccount(params: EditCashregisterAccountRequest) {
  return api.post<EditCashregisterAccountResponse>('cashregister-accounts/edit', params)
}

export async function removeCashregisterAccount(params: RemoveCashregisterAccountsRequest) {
  return api.post<RemoveCashregisterAccountsResponse>('cashregister-accounts/remove', params)
}
