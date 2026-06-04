import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface ProductPropertyGroupDTO {
  id: IdType
  names: LanguageString
  productProperties: IdType[]
  priority: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetProductPropertyGroupsResponse = ResponseList<ProductPropertyGroupDTO>

export type CreateProductPropertyGroupResponse = ResponseItem<ProductPropertyGroupDTO>

export type EditProductPropertyGroupResponse = ResponseItem<ProductPropertyGroupDTO>

export type RemoveProductPropertyGroupsResponse = Response
