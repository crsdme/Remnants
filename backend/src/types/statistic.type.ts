import type { Code, DateRange, Message, Sorter, Status } from './common.type'

export interface getStatisticResult {
  status: Status
  code: Code
  message: Message
  statistics: any
}

export interface getStatisticFilters {
  date: DateRange
  cashregister: string
  cashregisterAccount: string
}

export interface getStatisticParams {
  filters?: Partial<getStatisticFilters>
}
