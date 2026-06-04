import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface UnitDTO {
  id: IdType
  names: LanguageString
  symbols: LanguageString
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetUnitsResponse = ResponseList<UnitDTO>

export type CreateUnitsResponse = ResponseItem<UnitDTO>

export type EditUnitsResponse = ResponseItem<UnitDTO>

export type RemoveUnitsResponse = Response
