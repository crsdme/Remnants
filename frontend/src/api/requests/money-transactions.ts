import type {
  CreateMoneyTransactionRequest,
  CreateMoneyTransactionResponse,
  CreateMoneyTransactionTransferRequest,
  CreateMoneyTransactionTransferResponse,
  GetMoneyTransactionsRequest,
  GetMoneyTransactionsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getMoneyTransactions(params: GetMoneyTransactionsRequest) {
  return api.get<GetMoneyTransactionsResponse>('money-transactions/get', { params })
}

export async function createMoneyTransaction(params: CreateMoneyTransactionRequest) {
  return api.post<CreateMoneyTransactionResponse>('money-transactions/create-transaction', { ...params })
}

export async function createMoneyTransfer(params: CreateMoneyTransactionTransferRequest) {
  return api.post<CreateMoneyTransactionTransferResponse>('money-transactions/create-transfer', { ...params })
}
