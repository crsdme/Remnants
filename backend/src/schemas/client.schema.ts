import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getClientsSchema = z.object({
  filters: z.object({
    name: z.string().trim().optional(),
    middleName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    emails: z.array(z.string()).optional(),
    phones: z.array(z.string()).optional(),
    addresses: z.array(z.string()).optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    name: sorterParamsSchema.optional(),
    middleName: sorterParamsSchema.optional(),
    lastName: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const createClientSchema = z.object({
  name: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  emails: z.array(z.string().email()).optional(),
  phones: z.array(z.string().min(7)).min(1),
  addresses: z.array(z.string()).optional(),
  comment: z.string().optional(),
})

export const editClientSchema = z.object({
  id: idSchema,
  name: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  emails: z.array(z.string().email()).optional(),
  phones: z.array(z.string().min(7)).min(1),
  addresses: z.array(z.string()).optional(),
  comment: z.string().optional(),
})

export const removeClientsSchema = z.object({
  ids: z.array(idSchema).min(1),
})
