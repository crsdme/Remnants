import type { z } from 'zod'
import type { supplierDBSchema } from '../schemas'
import {
  createSupplierSchema,
  editSupplierSchema,
  getSuppliersSchema,
  removeSuppliersSchema,
} from '@remnant/shared'

export type SupplierDB = z.infer<typeof supplierDBSchema>

export type GetSuppliersPayload = z.output<typeof getSuppliersSchema>
export function parseGetSuppliers(x: unknown): GetSuppliersPayload {
  return getSuppliersSchema.parse(x)
}

export type CreateSupplierPayload = z.output<typeof createSupplierSchema>
export function parseCreateSupplier(x: unknown): CreateSupplierPayload {
  return createSupplierSchema.parse(x)
}

export type EditSupplierPayload = z.output<typeof editSupplierSchema>
export function parseEditSupplier(x: unknown): EditSupplierPayload {
  return editSupplierSchema.parse(x)
}

export type RemoveSuppliersPayload = z.output<typeof removeSuppliersSchema>
export function parseRemoveSuppliers(x: unknown): RemoveSuppliersPayload {
  return removeSuppliersSchema.parse(x)
}

export type GetSuppliersRepoPayload = GetSuppliersPayload
export interface GetSuppliersRepoResult {
  items: Array<{
    id: string
    seq: number
    name: string
    emails: string[]
    phones: string[]
    socials: Array<{ type: string, value: string }>
    comment?: string
    removed: boolean
    createdAt: Date
    updatedAt: Date
  }>
  total: number
  page: number
  pageSize: number
}

export type CreateSuppliersRepoPayload = CreateSupplierPayload
export type EditSuppliersRepoPayload = EditSupplierPayload
