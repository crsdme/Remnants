import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

export const getSuppliersSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    search: z.string().trim().optional(),
    emails: z.array(z.string()).optional(),
    phones: z.array(z.string()).optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetSuppliersRequest = z.input<typeof getSuppliersSchema>

export const createSupplierSchema = z.object({
  name: z.string(),
  emails: z.array(z.string().email()).optional(),
  phones: z.array(z.string().min(7)).optional(),
  socials: z.array(z.object({
    type: z.string(),
    value: z.string(),
  })).optional(),
  comment: z.string().optional(),
})

export type CreateSupplierRequest = z.input<typeof createSupplierSchema>

export const editSupplierSchema = z.object({
  id: idSchema,
  name: z.string(),
  emails: z.array(z.string().email()).optional(),
  phones: z.array(z.string().min(7)).optional(),
  socials: z.array(z.object({
    type: z.string(),
    value: z.string(),
  })).optional(),
  comment: z.string().optional(),
})

export type EditSupplierRequest = z.input<typeof editSupplierSchema>

export const removeSuppliersSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveSuppliersRequest = z.input<typeof removeSuppliersSchema>
