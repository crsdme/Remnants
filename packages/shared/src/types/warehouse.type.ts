import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface WarehouseDTO {
  id: IdType
  names: LanguageString
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetWarehousesResponse = ResponseList<WarehouseDTO>

export type CreateWarehousesResponse = ResponseItem<WarehouseDTO>

export type EditWarehousesResponse = ResponseItem<WarehouseDTO>

export type RemoveWarehousesResponse = Response
