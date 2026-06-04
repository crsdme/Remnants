import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface MoneyTransactionDTO {
  id: IdType
  seq: number
  type: string
  direction: string
  account: IdType
  minorAmount: number
  currency: IdType
  cashregister: IdType
  description: string
  sourceModel: string
  sourceId: IdType
  createdBy: IdType
  removedBy: IdType
  createdAt: Date
  updatedAt: Date
}

export type GetMoneyTransactionsResponse = ResponseList<MoneyTransactionDTO>

export type CreateMoneyTransactionResponseItem = ResponseItem<MoneyTransactionDTO>

export type CreateMoneyTransactionResponse = Response
