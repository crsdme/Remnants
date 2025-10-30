import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

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

export const removeSuppliersSchema = z.object({
  ids: z.array(idSchema).min(1),
})
