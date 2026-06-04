import type { IdType } from './common.type'
import type { CurrencyDTO } from './currency.type'

export interface ProcurementDTO {
  id: IdType
  supplier: string
  status: string
  warehouse: string
  expenses: string[]
  payments: string[]
  itemsByCurrency: {
    currency: CurrencyDTO
    amount: number
  }[]
  paymentsByCurrency: {
    currency: CurrencyDTO
    amount: number
  }[]
  balanceByCurrency: {
    currency: CurrencyDTO
    amount: number
  }[]
  createdBy: string
  removedBy: string
  comment: string
  createdAt: Date
  updatedAt: Date
}

export interface ProcurementItemDTO {
  id: IdType
  procurementId: string
  productId: string
  quantity: number
}
