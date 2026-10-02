import { z } from 'zod'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { supplierBalanceSchema } from './supplier.schema'

export const clientSchema = z.object({
  id: idSchema,
  seq: z.number(),
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
  debts: z.array(supplierBalanceSchema).optional().default([]),
  payments: z.array(supplierBalanceSchema).optional().default([]),
  balances: z.array(supplierBalanceSchema).optional().default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClientDTO = z.output<typeof clientSchema>

export const getClientsSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).default([]),
    seq: z.array(numberFromStringSchema).optional(),
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

export const getClientsResponseSchema = responseListSchema(clientSchema)
export type GetClientsResponse = z.output<typeof getClientsResponseSchema>

export const createClientResponseSchema = responseItemSchema(clientSchema)
export type CreateClientResponse = z.output<typeof createClientResponseSchema>

export const editClientResponseSchema = responseItemSchema(clientSchema)
export type EditClientResponse = z.output<typeof editClientResponseSchema>

export const removeClientsResponseSchema = responseSchema
export type RemoveClientsResponse = z.output<typeof removeClientsResponseSchema>

export const payClientSchema = z.object({
  clientId: idSchema,
  cashregister: idSchema.optional(),
  account: idSchema.optional(),
  currency: idSchema,
  amount: z.number().positive().optional(),
  comment: z.string().trim().optional(),
}).refine(data => data.amount == null || (Boolean(data.cashregister) && Boolean(data.account)), {
  message: 'Cashregister and account are required when paying from cash',
  path: ['cashregister'],
})
export type PayClientRequest = z.input<typeof payClientSchema>
export const payClientResponseSchema = responseItemSchema(clientSchema)
export type PayClientResponse = z.output<typeof payClientResponseSchema>
