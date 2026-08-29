import type {
  SiteDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { siteDBSchema } from '../schemas'
import {
  createSiteSchema,
  editSiteSchema,
  getSitesSchema,
  removeSitesSchema,
  syncSiteProductsSchema,
} from '@remnant/shared'

export type SiteDB = z.infer<typeof siteDBSchema>

export type GetSitesPayload = z.output<typeof getSitesSchema>
export function parseGetSites(x: unknown): GetSitesPayload {
  return getSitesSchema.parse(x)
}

export type CreateSitePayload = z.output<typeof createSiteSchema>
export function parseCreateSite(x: unknown): CreateSitePayload {
  return createSiteSchema.parse(x)
}

export type EditSitePayload = z.output<typeof editSiteSchema>
export function parseEditSite(x: unknown): EditSitePayload {
  return editSiteSchema.parse(x)
}

export type RemoveSitesPayload = z.output<typeof removeSitesSchema>
export function parseRemoveSites(x: unknown): RemoveSitesPayload {
  return removeSitesSchema.parse(x)
}

export type SyncSiteProductsPayload = z.output<typeof syncSiteProductsSchema>
export function parseSyncSiteProducts(x: unknown): SyncSiteProductsPayload {
  return syncSiteProductsSchema.parse(x)
}

export type GetSitesRepoPayload = GetSitesPayload
export interface GetSitesRepoResult { items: SiteDTO[], total: number, page: number, pageSize: number }

export type CreateSiteRepoPayload = CreateSitePayload

export type EditSiteRepoPayload = EditSitePayload
