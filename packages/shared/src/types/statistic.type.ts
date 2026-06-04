import type { Code, DateRange, Message, Status } from './common.type'

export interface GetStatisticResponse {
  status: Status
  code: Code
  message: Message
  statistics: any
}

export interface GetStatisticFilters {
  date: DateRange
  cashregister: string
  cashregisterAccount: string
}

export interface GetStatisticParams {
  filters?: Partial<GetStatisticFilters>
}
