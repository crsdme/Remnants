import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'
import type { Currency } from './currency.type'

export interface Procurement {
  id: IdType
  supplier: string
  status: string
  warehouse: string
  expenses: string[]
  payments: string[]
  itemsByCurrency: {
    currency: Currency
    amount: number
  }[]
  paymentsByCurrency: {
    currency: Currency
    amount: number
  }[]
  balanceByCurrency: {
    currency: Currency
    amount: number
  }[]
  createdBy: string
  removedBy: string
  comment: string
  createdAt: Date
  updatedAt: Date
}

export interface ProcurementItem {
  id: IdType
  procurementId: string
  productId: string
  quantity: number
}

export interface getProcurementsResult {
  status: Status
  code: Code
  message: Message
  procurements: Procurement[]
  procurementsCount: number
}

export interface getProcurementsFilters {
  ids: string[]
  seq: number
  supplier: string
  status: string
  warehouse: string
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getProcurementsSorters {
  type: Sorter
  direction: Sorter
  supplier: Sorter
  status: Sorter
  warehouse: Sorter
  createdAt: Sorter
  updatedAt: Sorter
}

export interface getProcurementsParams {
  filters?: Partial<getProcurementsFilters>
  sorters?: Partial<getProcurementsSorters>
  pagination?: Partial<Pagination>
}

export interface createProcurementResult {
  status: Status
  code: Code
  message: Message
  procurement: Procurement
}

export interface createProcurementParams {
  supplier: string
  comment: string
  items: {
    id: string
    quantity: number
    purchasePrice: number
    purchaseCurrency: string
  }[]
}

export interface editProcurementResult {
  status: Status
  code: Code
  message: Message
  procurement: Procurement
}

export interface editProcurementParams {
  id: IdType
  supplier: string
  status: string
  warehouse: string
  expenses: string[]
  payments: string[]
  comment: string
}

export interface removeProcurementsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeProcurementsParams {
  ids: IdType[]
}

export interface getProcurementItemsParams {
  filters: {
    procurementId: string
  }
  pagination?: {
    current?: number
    pageSize?: number
    full?: boolean
  }
}

export interface getProcurementItemsResult {
  status: Status
  code: Code
  message: Message
  procurementItems: ProcurementItem[]
  procurementItemsCount: number
}

export interface receiveProcurementResult {
  status: Status
  code: Code
  message: Message
  procurement: Procurement
}

export interface receiveProcurementParams {
  id: IdType
  items: ProcurementItem[]
}

export interface scanBarcodeParams {
  barcode: string
  procurementId?: string
}

export interface scanBarcodeResult {
  status: Status
  code: Code
  message: Message
  procurementItems: ProcurementItem[]
  transactionId?: string
}

export interface payProcurementParams {
  id: IdType
  procurementId: string
  cashregister: string
  account: string
  direction: string
  currency: string
  amount: number
  comment: string
}

export interface payProcurementResult {
  status: Status
  code: Code
  message: Message
  procurement: Procurement
}
