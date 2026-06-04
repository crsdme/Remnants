import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface ProductPropertyDTO {
  id: IdType
  names: LanguageString
  symbols?: LanguageString
  options?: IdType[]
  priority: number
  type: string
  isRequired: boolean
  showInTable: boolean
  showInStatistics: boolean
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetProductPropertiesResponse = ResponseList<ProductPropertyDTO>

export type CreateProductPropertyResponse = ResponseItem<ProductPropertyDTO>

export type EditProductPropertyResponse = ResponseItem<ProductPropertyDTO>

export type RemoveProductPropertiesResponse = Response
