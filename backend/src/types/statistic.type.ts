import type { Code, DateRange, Message, Sorter, Status } from './common.type'

export interface getStatisticResult {
  status: Status
  code: Code
  message: Message
  statistics: any
}

export interface getStatisticFilters {
  date: DateRange
  warehouse: string
  deliveryService: string
  orderSource: string
}

export interface getStatisticSorters {
  date: Sorter
  warehouse: Sorter
  deliveryService: Sorter
  orderSource: Sorter
}

export interface getStatisticParams {
  filters?: Partial<getStatisticFilters>
  sorters?: Partial<getStatisticSorters>
}
