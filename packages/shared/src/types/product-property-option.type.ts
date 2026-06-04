import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface ProductPropertyOptionDTO {
  id: IdType
  names: LanguageString
  priority: number
  active: boolean
  removed: boolean
  color: string
  createdAt: Date
  updatedAt: Date
}

export type GetProductPropertyOptionsResponse = ResponseList<ProductPropertyOptionDTO>

export type CreateProductPropertyOptionResponse = ResponseItem<ProductPropertyOptionDTO>

export type EditProductPropertyOptionResponse = ResponseItem<ProductPropertyOptionDTO>

export type RemoveProductPropertyOptionsResponse = Response
