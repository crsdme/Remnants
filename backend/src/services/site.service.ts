import type {
  CreateSiteParams,
  CreateSiteResponse,
  EditSiteParams,
  EditSiteResponse,
  GetSitesParams,
  GetSitesResponse,
  RemoveSitesParams,
  RemoveSitesResponse,
} from '@remnant/shared'
import { SiteModel } from '@/models/'
import * as StatisticService from '@/services/statistic.service'

import { buildQuery, buildSortQuery, HttpError } from '@/utils/'

export async function get(payload: GetSitesParams): Promise<GetSitesResponse> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  await StatisticService.get({
    filters: {
      date: {
        from: new Date('2025-08-01'),
        to: new Date('2025-08-31'),
      },
    },
  })

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

  return {
    status: 'success',
    code: 'SITES_FETCHED',
    message: 'Sites fetched',
    data: {
      items: sites,
      pagination: {
        page: current,
        pageSize,
        total: sitesCount,
      },
    },
  }
}

export async function create(payload: CreateSiteParams): Promise<CreateSiteResponse> {
  const site = await SiteModel.create(payload)

  return {
    status: 'success',
    code: 'SITE_CREATED',
    message: 'Site created',
    data: site,
  }
}

export async function edit(payload: EditSiteParams): Promise<EditSiteResponse> {
  const { id } = payload

  const site = await SiteModel.findOneAndUpdate({ _id: id }, payload)

  if (!site) {
    throw new HttpError(400, 'Site not edited', 'SITE_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'SITE_EDITED',
    message: 'Site edited',
    data: site,
  }
}

export async function remove(payload: RemoveSitesParams): Promise<RemoveSitesResponse> {
  const { ids } = payload

  const sites = await SiteModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!sites) {
    throw new HttpError(400, 'Sites not removed', 'SITES_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'SITES_REMOVED',
    message: 'Sites removed',
  }
}
