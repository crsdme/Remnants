import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface CategoryDTO {
  id: IdType
  seq: number
  names: LanguageString
  priority: number
  parent?: IdType
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetCategoriesResponse = ResponseList<CategoryDTO>

export type CreateCategoryResponse = ResponseItem<CategoryDTO>

export type EditCategoryResponse = ResponseItem<CategoryDTO>

export type RemoveCategoriesResponse = Response
