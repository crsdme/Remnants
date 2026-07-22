import { dateRangeSchema, idSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from '@remnant/shared'
import { z } from 'zod'

export const syncEntryDBSchema = z.object({
  _id: idSchema,
  sourceType: z.string(),
  sourceId: idSchema,
  site: idSchema,
  externalId: z.string(),
  status: z.enum(['pending', 'synced', 'error']),
  syncedAt: z.coerce.date(),
  lastError: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const syncEntrySchema = z.object({
  id: idSchema,
  sourceType: z.string(),
  sourceId: idSchema,
  site: idSchema,
  externalId: z.string(),
  status: z.enum(['pending', 'synced', 'error']),
  syncedAt: z.date(),
  lastError: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const getSyncEntriesSchema = z.object({
  filters: z.object({
    sourceType: z.string(),
    sourceId: idSchema,
    site: idSchema,
    externalId: z.string(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }),
  sorters: z.object({
    createdAt: sorterParamsSchema.optional(),
  }),
  pagination: paginationSchema.optional().default({}),
})

export const createSyncEntrySchema = z.object({
  sourceType: z.string(),
  sourceId: idSchema,
  site: idSchema,
  externalId: z.string(),
  status: z.string(),
  syncedAt: z.date(),
  lastError: z.string(),
})

export const editSyncEntrySchema = z.object({
  id: idSchema,
  sourceType: z.string(),
  sourceId: idSchema,
  site: idSchema,
  externalId: z.string(),
  status: z.string(),
  syncedAt: z.date(),
  lastError: z.string(),
})

export const removeSyncEntriesSchema = z.object({
  ids: z.array(idSchema),
})

export const countSyncEntriesSchema = z.object({
  filters: z.object({
    sourceType: z.string(),
    sourceId: idSchema,
    site: idSchema,
    externalId: z.string(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }),
})

export const syncProductCreateSchema = z.object({
  siteId: idSchema,
  productId: idSchema,
})

export const syncProductEditSchema = z.object({
  siteId: idSchema,
  productId: idSchema,
  difference: z.record(z.string(), z.unknown()),
})

export const syncProductQuantitySchema = z.object({
  siteId: idSchema,
  productId: idSchema,
  quantity: z.number(),
})

export const getSyncEntriesResponseSchema = responseListSchema(syncEntrySchema)

export const createSyncEntryResponseSchema = responseItemSchema(syncEntrySchema)

export const editSyncEntryResponseSchema = responseItemSchema(syncEntrySchema)

export const removeSyncEntriesResponseSchema = responseSchema

export const countSyncEntriesResponseSchema = responseSchema

export const syncProductCreateResponseSchema = responseSchema

export const syncProductEditResponseSchema = responseSchema

export const syncProductQuantityResponseSchema = responseSchema
