import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface CashregisterAccountDTO {
  id: IdType
  names: LanguageString
  currencies: string[]
  priority: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetCashregisterAccountsResponse = ResponseList<CashregisterAccountDTO>

export type CreateCashregisterAccountResponse = ResponseItem<CashregisterAccountDTO>

export type EditCashregisterAccountResponse = ResponseItem<CashregisterAccountDTO>

export type RemoveCashregisterAccountsResponse = Response
