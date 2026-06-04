import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

export const getClientsSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).default([]),
    search: z.string().trim().optional(),
    emails: z.array(z.string()).default([]),
    phones: z.array(z.string()).default([]),
    addresses: z.array(z.string()).default([]),
    country: z.string().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).default({}),
  sorters: z.object({
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema.optional().default({}),
})

export type GetClientsRequest = z.input<typeof getClientsSchema>

export const createClientSchema = z.object({
  name: z.string(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
  emails: z.array(z.string().email()).optional(),
  phones: z.array(z.string().min(7)).optional(),
  addresses: z.array(z.string()).optional(),
  socials: z.array(z.object({
    type: z.string(),
    value: z.string(),
  })).optional(),
  comment: z.string().optional(),
})

export type CreateClientRequest = z.input<typeof createClientSchema>

export const editClientSchema = z.object({
  id: idSchema,
  name: z.string(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
  emails: z.array(z.string().email()).optional(),
  phones: z.array(z.string().min(7)).optional(),
  addresses: z.array(z.string()).optional(),
  socials: z.array(z.object({
    type: z.string(),
    value: z.string(),
  })).optional(),
  comment: z.string().optional(),
})

export type EditClientRequest = z.input<typeof editClientSchema>

export const removeClientsSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveClientsRequest = z.input<typeof removeClientsSchema>
