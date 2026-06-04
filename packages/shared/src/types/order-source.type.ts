import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface OrderSourceDTO {
  id: IdType
  names: LanguageString
  priority: number
  color: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetOrderSourcesResponse = ResponseList<OrderSourceDTO>

export type CreateOrderSourceResponse = ResponseItem<OrderSourceDTO>

export type EditOrderSourceResponse = ResponseItem<OrderSourceDTO>

export type RemoveOrderSourcesResponse = Response
