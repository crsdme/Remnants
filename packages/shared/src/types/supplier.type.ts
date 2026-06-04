import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface SupplierDTO {
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

export type GetSuppliersResponse = ResponseList<SupplierDTO>

export type CreateSupplierResponse = ResponseItem<SupplierDTO>

export type EditSupplierResponse = ResponseItem<SupplierDTO>

export type RemoveSuppliersResponse = Response
