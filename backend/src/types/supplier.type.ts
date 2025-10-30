import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface Supplier {
  id: IdType
  name: string
  emails: string[]
  phones: string[]
  socials: {
    type: string
    value: string
  }[]
  comment: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getSuppliersResult {
  status: Status
  code: Code
  message: Message
  suppliers: Supplier[]
  suppliersCount: number
}

export interface getSuppliersFilters {
  ids: string[]
  search: string
  emails: string[]
  phones: string[]
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getSuppliersSorters {
  emails: Sorter
  phones: Sorter
  addresses: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getSuppliersParams {
  filters?: Partial<getSuppliersFilters>
  sorters?: Partial<getSuppliersSorters>
  pagination?: Partial<Pagination>
}

export interface createSupplierResult {
  status: Status
  code: Code
  message: Message
  supplier: Supplier
}

export interface createSupplierParams {
  name: string
  emails: string[]
  phones: string[]
  socials: {
    type: string
    value: string
  }[]
  comment?: string
}

export interface editSupplierResult {
  status: Status
  code: Code
  message: Message
  supplier: Supplier
}

export interface editSupplierParams {
  id: IdType
  name: string
  emails: string[]
  phones: string[]
  socials: {
    type: string
    value: string
  }[]
  comment?: string
}

export interface removeSuppliersResult {
  status: Status
  code: Code
  message: Message
}

export interface removeSuppliersParams {
  ids: IdType[]
}
