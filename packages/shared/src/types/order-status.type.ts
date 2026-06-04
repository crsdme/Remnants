import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface OrderStatusDTO {
  id: IdType
  names: LanguageString
  priority: number
  ordersCount?: number
  isSelectable: boolean
  color: string
  isLocked: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetOrderStatusesResponse = ResponseList<OrderStatusDTO>

export type CreateOrderStatusResponse = ResponseItem<OrderStatusDTO>

export type EditOrderStatusResponse = ResponseItem<OrderStatusDTO>

export type RemoveOrderStatusesResponse = Response
