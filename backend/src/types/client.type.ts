import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface Client {
  id: IdType
  name: string
  middleName: string
  lastName: string
  emails: string[]
  phones: string[]
  addresses: string[]
  comment: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getClientsResult {
  status: Status
  code: Code
  message: Message
  clients: Client[]
  clientsCount: number
}

export interface getClientsFilters {
  search: string
  emails: string[]
  phones: string[]
  addresses: string[]
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getClientsSorters {
  emails: Sorter
  phones: Sorter
  addresses: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getClientsParams {
  filters?: Partial<getClientsFilters>
  sorters?: Partial<getClientsSorters>
  pagination?: Partial<Pagination>
}

export interface createClientResult {
  status: Status
  code: Code
  message: Message
  client: Client
}

export interface createClientParams {
  name: string
  middleName: string
  lastName: string
  emails: string[]
  phones: string[]
  comment?: string
}

export interface editClientResult {
  status: Status
  code: Code
  message: Message
  client: Client
}

export interface editClientParams {
  id: IdType
  name: string
  middleName: string
  lastName: string
  emails: string[]
  phones: string[]
  addresses: string[]
  comment?: string
}

export interface removeClientsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeClientsParams {
  ids: IdType[]
}
