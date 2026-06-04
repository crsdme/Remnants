import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface ExpenseCategoryDTO {
  id: IdType
  names: LanguageString
  color: string
  comment: string
  priority: number
  createdAt: Date
  updatedAt: Date
}

export type GetExpenseCategoriesResponse = ResponseList<ExpenseCategoryDTO>

export type CreateExpenseCategoryResponse = ResponseItem<ExpenseCategoryDTO>

export type EditExpenseCategoryResponse = ResponseItem<ExpenseCategoryDTO>

export type RemoveExpenseCategoriesResponse = Response
