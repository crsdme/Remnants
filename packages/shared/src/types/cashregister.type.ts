import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface CashregisterDTO {
  id: IdType
  names: LanguageString
  priority: number
  accounts: {
    id: IdType
    seq: number
    names: LanguageString
    currencies: string[]
    priority: number
    active: boolean
  }[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetCashregistersResponse = ResponseList<CashregisterDTO>

export type CreateCashregisterResponse = ResponseItem<CashregisterDTO>

export type EditCashregisterResponse = ResponseItem<CashregisterDTO>

export type RemoveCashregistersResponse = Response
