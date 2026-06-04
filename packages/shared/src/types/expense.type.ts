import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface ExpenseDTO {
  id: IdType
  seq: number
  amount: number
  currency: IdType
  cashregister: IdType
  cashregisterAccount: IdType
  categories: IdType[]
  sourceModel: string
  sourceId: IdType
  type: string
  comment: string
  createdBy: IdType
  removedBy: IdType
  createdAt: Date
  updatedAt: Date
}

export type GetExpensesResponse = ResponseList<ExpenseDTO>

export type CreateExpenseResponse = ResponseItem<ExpenseDTO>

export type EditExpenseResponse = ResponseItem<ExpenseDTO>

export type RemoveExpensesResponse = Response
