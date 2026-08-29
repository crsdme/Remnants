import { z } from 'zod'
import { dateRangeSchema, idSchema, idSchemaOptional, languageStringSchema, numberFromStringSchema, paginationResponseSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const siteSyncSourceTypeSchema = z.enum(['product', 'category', 'attribute', 'language'])
export type SiteSyncSourceType = z.output<typeof siteSyncSourceTypeSchema>

export const siteSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  url: z.string().trim(),
  key: z.string().trim(),
  priority: z.number(),
  active: z.boolean(),
  warehouseIds: z.array(idSchema),
  currencyId: idSchemaOptional,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type SiteDTO = z.output<typeof siteSchema>

export const getSitesSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    url: z.string().trim().optional(),
    key: z.string().trim().optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    url: sorterParamsSchema.optional(),
    key: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetSitesRequest = z.input<typeof getSitesSchema>

export const createSiteSchema = z.object({
  names: languageStringSchema,
  url: z.string().trim(),
  key: z.string().trim(),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
  warehouseIds: z.array(idSchema).optional().default([]),
  currencyId: idSchemaOptional,
})

export type CreateSiteRequest = z.input<typeof createSiteSchema>

export const editSiteSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  url: z.string().trim(),
  key: z.string().trim(),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
  warehouseIds: z.array(idSchema).optional().default([]),
  currencyId: z.union([idSchema, z.null()]).optional(),
})

export type EditSiteRequest = z.input<typeof editSiteSchema>

export const removeSitesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveSitesRequest = z.input<typeof removeSitesSchema>

export const getSitesResponseSchema = responseListSchema(siteSchema)
export type GetSitesResponse = z.output<typeof getSitesResponseSchema>

export const createSiteResponseSchema = responseItemSchema(siteSchema)
export type CreateSiteResponse = z.output<typeof createSiteResponseSchema>

export const editSiteResponseSchema = responseItemSchema(siteSchema)
export type EditSiteResponse = z.output<typeof editSiteResponseSchema>

export const removeSitesResponseSchema = responseSchema
export type RemoveSitesResponse = z.output<typeof removeSitesResponseSchema>

export const syncSiteProductsSchema = z.object({
  id: idSchema,
})

export type SyncSiteProductsRequest = z.input<typeof syncSiteProductsSchema>

export const syncSiteProductsResultSchema = z.object({
  total: z.number(),
  synced: z.number(),
  failed: z.number(),
})

export type SyncSiteProductsResultDTO = z.output<typeof syncSiteProductsResultSchema>

export const syncSiteProductsResponseSchema = responseItemSchema(syncSiteProductsResultSchema)
export type SyncSiteProductsResponse = z.output<typeof syncSiteProductsResponseSchema>

function toSyncNames(value: unknown): Record<string, string> {
  const source = value instanceof Map ? Object.fromEntries(value.entries()) : value
  if (source == null || typeof source !== 'object' || Array.isArray(source))
    return {}

  const names: Record<string, string> = {}
  for (const [key, name] of Object.entries(source as Record<string, unknown>)) {
    if (typeof name === 'string')
      names[key] = name
  }
  return names
}

export const siteSyncItemSchema = z.object({
  id: z.coerce.string(),
  names: z.preprocess(toSyncNames, z.record(z.string(), z.string())),
  parentId: z.preprocess(
    value => (value == null || value === '' || value === 0 || value === '0' ? undefined : String(value)),
    z.string().optional(),
  ),
})

export type SiteSyncItemDTO = z.output<typeof siteSyncItemSchema>

export const siteSyncLinkSchema = z.object({
  sourceId: idSchema,
  externalIds: z.array(z.string()),
})

export type SiteSyncLinkDTO = z.output<typeof siteSyncLinkSchema>

export const getSiteSyncMappingSchema = z.object({
  id: idSchema,
  sourceType: siteSyncSourceTypeSchema,
  names: z.string().trim().optional(),
  pagination: paginationSchema.optional().default({}),
})

export type GetSiteSyncMappingRequest = z.input<typeof getSiteSyncMappingSchema>

export const siteSyncMappingResultSchema = z.object({
  crmItems: z.array(siteSyncItemSchema),
  siteItems: z.array(siteSyncItemSchema),
  links: z.array(siteSyncLinkSchema),
  pagination: paginationResponseSchema,
})

export type SiteSyncMappingResultDTO = z.output<typeof siteSyncMappingResultSchema>

export const getSiteSyncMappingResponseSchema = responseItemSchema(siteSyncMappingResultSchema)
export type GetSiteSyncMappingResponse = z.output<typeof getSiteSyncMappingResponseSchema>

export const saveSiteSyncMappingSchema = z.object({
  id: idSchema,
  sourceType: siteSyncSourceTypeSchema,
  sourceId: idSchema,
  externalIds: z.array(z.string().trim()).default([]),
})

export type SaveSiteSyncMappingRequest = z.input<typeof saveSiteSyncMappingSchema>

export const saveSiteSyncMappingResponseSchema = responseItemSchema(siteSyncLinkSchema)
export type SaveSiteSyncMappingResponse = z.output<typeof saveSiteSyncMappingResponseSchema>

export const getSiteSyncSiteItemsSchema = z.object({
  id: idSchema,
  sourceType: siteSyncSourceTypeSchema,
  query: z.string().trim().optional(),
  ids: z.preprocess(
    (value) => {
      if (Array.isArray(value))
        return value
      if (typeof value === 'string' && value.trim() !== '')
        return value.split(',').map(item => item.trim()).filter(item => item !== '')
      return undefined
    },
    z.array(z.string()).optional(),
  ),
})

export type GetSiteSyncSiteItemsRequest = z.input<typeof getSiteSyncSiteItemsSchema>

export const siteSyncSiteItemsResultSchema = z.object({
  items: z.array(siteSyncItemSchema),
})

export type SiteSyncSiteItemsResultDTO = z.output<typeof siteSyncSiteItemsResultSchema>

export const getSiteSyncSiteItemsResponseSchema = responseItemSchema(siteSyncSiteItemsResultSchema)
export type GetSiteSyncSiteItemsResponse = z.output<typeof getSiteSyncSiteItemsResponseSchema>
