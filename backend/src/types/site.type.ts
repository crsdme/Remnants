import type {
  LanguageString,
  SiteDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  createSiteSchema,
  editSiteSchema,
  getSitesSchema,
  removeSitesSchema,
} from '@remnant/shared'

export interface SiteDB {
  _id: string
  names: LanguageString
  url: string
  key: string
  priority: number
  active: boolean
  warehouses: string[]
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

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

export type GetSitesRepoPayload = GetSitesPayload
export interface GetSitesRepoResult { items: SiteDTO[], total: number, page: number, pageSize: number }

export type CreateSiteRepoPayload = CreateSitePayload

export type EditSiteRepoPayload = EditSitePayload
