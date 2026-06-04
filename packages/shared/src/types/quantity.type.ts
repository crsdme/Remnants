import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface QuantityDTO {
  id: IdType
  count: number
  product: IdType
  warehouse: IdType
  status: 'available' | 'reserved' | 'sold'
  createdAt: Date
  updatedAt: Date
}

export type GetQuantitiesResponse = ResponseList<QuantityDTO>

export type CreateQuantitiesResponse = ResponseItem<QuantityDTO>

export type CountQuantitiesResponse = Response

export type EditQuantitiesResponse = ResponseItem<QuantityDTO>

export type RemoveQuantitiesResponse = Response
