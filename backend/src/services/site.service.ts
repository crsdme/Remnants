import type * as SiteTypes from '../types/site.type'
import { SiteModel } from '../models/site.model'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: SiteTypes.getSitesParams): Promise<SiteTypes.getSitesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    names = '',
    url = '',
    key = '',
    priority = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters || {}

  const filterRules = {
    _id: { type: 'array' },
    names: { type: 'string' },
    url: { type: 'string' },
    key: { type: 'string' },
    priority: { type: 'number' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { names, url, key, priority, createdAt, updatedAt },
    rules: filterRules,
  })
  const sorters = buildSortQuery(payload.sorters || {}, { createdAt: 1 })
  console.log(query)
  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $facet: {
        sites: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const sitesRaw = await SiteModel.aggregate(pipeline).exec()

  const sites = sitesRaw[0].sites.map((doc: any) => SiteModel.hydrate(doc))
  const sitesCount = sitesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'SITES_FETCHED', message: 'Sites fetched', sites, sitesCount }
}

export async function create(payload: SiteTypes.createSiteParams): Promise<SiteTypes.createSiteResult> {
  const site = await SiteModel.create(payload)

  return { status: 'success', code: 'SITE_CREATED', message: 'Site created', site }
}

export async function edit(payload: SiteTypes.editSiteParams): Promise<SiteTypes.editSiteResult> {
  const { id } = payload

  const site = await SiteModel.findOneAndUpdate({ _id: id }, payload)

  if (!site) {
    throw new HttpError(400, 'Site not edited', 'SITE_NOT_EDITED')
  }

  return { status: 'success', code: 'SITE_EDITED', message: 'Site edited', site }
}

export async function remove(payload: SiteTypes.removeSitesParams): Promise<SiteTypes.removeSitesResult> {
  const { ids } = payload

  const sites = await SiteModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!sites) {
    throw new HttpError(400, 'Sites not removed', 'SITES_NOT_REMOVED')
  }

  return { status: 'success', code: 'SITES_REMOVED', message: 'Sites removed' }
}
