import { z } from 'zod'
import { barcodeDTOPopulatedSchema } from './barcode.schema'
import {
  dateRangeSchema,
  idSchema,
  idSchemaOptional,
  languageStringSchema,
  numberFromStringSchema,
  paginationSchema,
  responseListSchema,
  responseSchema,
  sorterParamsSchema,
} from './common'
import { productSchemaPopulated } from './product.schema'

export const warehouseTransactionSchema = z.object({
  id: idSchema,
  seq: z.number(),
  type: z.string().trim(),
  fromWarehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
  }).optional(),
  toWarehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
  }).optional(),
  requiresReceiving: z.boolean().optional().default(true),
  status: z.string().trim(),
  accepted: z.boolean().optional().default(false),
  acceptedBy: idSchemaOptional,
  createdBy: idSchemaOptional,
  removedBy: idSchemaOptional,
  comment: z.string().trim().optional().default(''),
  removedAt: z.coerce.date().optional().nullable(),
  acceptedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type WarehouseTransactionDTO = z.output<typeof warehouseTransactionSchema>

export const warehouseTransactionItemSchema = z.object({
  id: idSchema,
  transactionId: idSchema,
  productId: idSchema,
  product: productSchemaPopulated,
  quantity: z.number(),
  price: z.number(),
})
export type WarehouseTransactionItemDTO = z.output<typeof warehouseTransactionItemSchema>

export const getWarehouseTransactionsSchema = z.object({
  filters: z.object({
    seq: z.number().optional(),
    id: idSchemaOptional,
    type: z.string().trim().optional(),
    direction: z.string().trim().optional(),
    accountId: idSchemaOptional,
    amount: numberFromStringSchema.optional(),
    currency: idSchemaOptional,
    cashregister: idSchemaOptional,
    description: z.string().trim().optional(),
    sourceModel: z.string().trim().optional(),
    sourceId: idSchemaOptional,
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

export type GetWarehouseTransactionsRequest = z.input<typeof getWarehouseTransactionsSchema>

const baseCreateWarehouseTransactionSchema = z.object({
  comment: z.string().trim().optional(),
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
  })),
  createdBy: idSchema,
  status: z.enum(['draft', 'confirmed', 'awaiting', 'received', 'cancelled']).optional().default('draft'),
})

const inWarehouseTransactionSchema = baseCreateWarehouseTransactionSchema.extend({
  type: z.literal('in'),
  toWarehouseId: idSchema,
})

const outWarehouseTransactionSchema = baseCreateWarehouseTransactionSchema.extend({
  type: z.literal('out'),
  fromWarehouseId: idSchema,
})

const transferWarehouseTransactionSchema = baseCreateWarehouseTransactionSchema.extend({
  type: z.literal('transfer'),
  fromWarehouseId: idSchema,
  toWarehouseId: idSchema,
  requiresReceiving: z.boolean().optional(),
})

export const createWarehouseTransactionSchema = z.discriminatedUnion('type', [
  inWarehouseTransactionSchema,
  outWarehouseTransactionSchema,
  transferWarehouseTransactionSchema,
])

export type CreateWarehouseTransactionRequest = z.input<typeof createWarehouseTransactionSchema>

export const createWarehouseTransactionItemsSchema = z.object({
  transactionId: idSchema,
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
  })),
})

export type CreateWarehouseTransactionItemsRequest = z.input<typeof createWarehouseTransactionItemsSchema>

export const removeWarehouseTransactionsSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveWarehouseTransactionsRequest = z.input<typeof removeWarehouseTransactionsSchema>

export const getWarehouseTransactionsItemsSchema = z.object({
  filters: z.object({
    transactionId: idSchemaOptional,
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetWarehouseTransactionsItemsRequest = z.input<typeof getWarehouseTransactionsItemsSchema>

export const getWarehouseTransactionDetailsSchema = z.object({
  seq: numberFromStringSchema,
})

export type GetWarehouseTransactionDetailsRequest = z.input<typeof getWarehouseTransactionDetailsSchema>

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
  toWarehouseId: idSchema,
})

const outWarehouseTransactionEditSchema = baseEditWarehouseTransactionSchema.extend({
  type: z.literal('out'),
  fromWarehouseId: idSchema,
})

const transferWarehouseTransactionEditSchema = baseEditWarehouseTransactionSchema.extend({
  type: z.literal('transfer'),
  fromWarehouseId: idSchema,
  toWarehouseId: idSchema,
  requiresReceiving: z.boolean().optional(),
})

export const editWarehouseTransactionSchema = z.discriminatedUnion('type', [
  inWarehouseTransactionEditSchema,
  outWarehouseTransactionEditSchema,
  transferWarehouseTransactionEditSchema,
])

export type EditWarehouseTransactionRequest = z.input<typeof editWarehouseTransactionSchema>

export const receiveWarehouseTransactionSchema = z.object({
  id: idSchema,
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
    receivedQuantity: z.number(),
  })),
})
export const scanBarcodeToDraftSchema = z.object({
  barcode: z.string().trim(),
  transactionId: idSchemaOptional,
})

export type ReceiveWarehouseTransactionRequest = z.input<typeof receiveWarehouseTransactionSchema>

export const getWarehouseTransactionsResponseSchema = responseListSchema(warehouseTransactionSchema)
export type GetWarehouseTransactionsResponse = z.output<typeof getWarehouseTransactionsResponseSchema>

export const createWarehouseTransactionResponseSchema = responseSchema
export type CreateWarehouseTransactionResponse = z.output<typeof createWarehouseTransactionResponseSchema>

export const editWarehouseTransactionResponseSchema = responseSchema
export type EditWarehouseTransactionResponse = z.output<typeof editWarehouseTransactionResponseSchema>

export const removeWarehouseTransactionsResponseSchema = responseSchema
export type RemoveWarehouseTransactionsResponse = z.output<typeof removeWarehouseTransactionsResponseSchema>

export const getWarehouseTransactionsItemsResponseSchema = responseListSchema(warehouseTransactionItemSchema)
export type GetWarehouseTransactionsItemsResponse = z.output<typeof getWarehouseTransactionsItemsResponseSchema>

export const receiveWarehouseTransactionResponseSchema = responseSchema
export type ReceiveWarehouseTransactionResponse = z.output<typeof receiveWarehouseTransactionResponseSchema>

export const getWarehouseTransactionDetailsResponseSchema = responseSchema
export type GetWarehouseTransactionDetailsResponse = z.output<typeof getWarehouseTransactionDetailsResponseSchema> & { data: {
  warehouseTransaction: WarehouseTransactionDTO
  warehouseTransactionItems: WarehouseTransactionItemDTO[]
} }

export const scanBarcodeToDraftResponseSchema = responseSchema.extend({
  item: barcodeDTOPopulatedSchema,
  transactionId: idSchemaOptional,
})
export type ScanBarcodeToDraftResponse = z.output<typeof scanBarcodeToDraftResponseSchema>
