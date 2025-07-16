import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getWarehouseTransactionsSchema = z.object({
  filters: z.object({
    type: z.string().trim().optional(),
    direction: z.string().trim().optional(),
    accountId: z.string().trim().optional(),
    amount: numberFromStringSchema.optional(),
    currency: idSchema.optional(),
    cashregister: idSchema.optional(),
    description: z.string().trim().optional(),
    sourceModel: z.string().trim().optional(),
    sourceId: z.string().trim().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    type: sorterParamsSchema.optional(),
    direction: sorterParamsSchema.optional(),
    accountId: sorterParamsSchema.optional(),
    sourceModel: sorterParamsSchema.optional(),
    sourceId: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

const baseCreateWarehouseTransactionSchema = z.object({
  comment: z.string().trim().optional(),
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
  })),
})

const inWarehouseTransactionSchema = baseCreateWarehouseTransactionSchema.extend({
  type: z.literal('in'),
  toWarehouse: idSchema,
})

const outWarehouseTransactionSchema = baseCreateWarehouseTransactionSchema.extend({
  type: z.literal('out'),
  fromWarehouse: idSchema,
})

const transferWarehouseTransactionSchema = baseCreateWarehouseTransactionSchema.extend({
  type: z.literal('transfer'),
  fromWarehouse: idSchema,
  toWarehouse: idSchema,
  requiresReceiving: z.boolean().optional(),
})

export const createWarehouseTransactionSchema = z.discriminatedUnion('type', [
  inWarehouseTransactionSchema,
  outWarehouseTransactionSchema,
  transferWarehouseTransactionSchema,
])

export const removeWarehouseTransactionsSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const getWarehouseTransactionsItemsSchema = z.object({
  filters: z.object({
    transactionId: z.string().trim().optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

const baseEditWarehouseTransactionSchema = z.object({
  id: idSchema,
  comment: z.string().trim().optional(),
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
  })),
})

const inWarehouseTransactionEditSchema = baseEditWarehouseTransactionSchema.extend({
  type: z.literal('in'),
  toWarehouse: idSchema,
})

const outWarehouseTransactionEditSchema = baseEditWarehouseTransactionSchema.extend({
  type: z.literal('out'),
  fromWarehouse: idSchema,
})

const transferWarehouseTransactionEditSchema = baseEditWarehouseTransactionSchema.extend({
  type: z.literal('transfer'),
  fromWarehouse: idSchema,
  toWarehouse: idSchema,
  requiresReceiving: z.boolean().optional(),
})

export const editWarehouseTransactionSchema = z.discriminatedUnion('type', [
  inWarehouseTransactionEditSchema,
  outWarehouseTransactionEditSchema,
  transferWarehouseTransactionEditSchema,
])

export const receiveWarehouseTransactionSchema = z.object({
  id: idSchema,
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
    receivedQuantity: z.number(),
  })),
})
