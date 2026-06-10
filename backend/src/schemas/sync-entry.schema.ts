import { dateRangeSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from '@remnant/shared'
import { z } from 'zod'

export const syncEntrySchema = z.object({
  id: z.string(),
  sourceType: z.string(),
  sourceId: z.string(),
  site: z.string(),
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
    sourceId: z.string(),
    site: z.string(),
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
  sourceId: z.string(),
  site: z.string(),
  externalId: z.string(),
  status: z.string(),
  syncedAt: z.date(),
  lastError: z.string(),
})

export const editSyncEntrySchema = z.object({
  id: z.string(),
  sourceType: z.string(),
  sourceId: z.string(),
  site: z.string(),
  externalId: z.string(),
  status: z.string(),
  syncedAt: z.date(),
  lastError: z.string(),
})

export const removeSyncEntriesSchema = z.object({
  ids: z.array(z.string()),
})

export const countSyncEntriesSchema = z.object({
  filters: z.object({
    sourceType: z.string(),
    sourceId: z.string(),
    site: z.string(),
    externalId: z.string(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }),
})

export const syncProductCreateSchema = z.object({
  siteId: z.string(),
  productId: z.string(),
})

export const syncProductEditSchema = z.object({
  siteId: z.string(),
  productId: z.string(),
  difference: z.record(z.string(), z.unknown()),
})

export const syncProductQuantitySchema = z.object({
  siteId: z.string(),
  productId: z.string(),
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
