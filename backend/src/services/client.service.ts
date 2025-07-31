import type * as ClientTypes from '../types/client.type'
import { ClientModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: ClientTypes.getClientsParams): Promise<ClientTypes.getClientsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    search = '',
    emails = [],
    phones = [],
    addresses = [],
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
    search: { type: 'string' },
    emails: { type: 'array' },
    phones: { type: 'array' },
    addresses: { type: 'array' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { emails, phones, addresses, createdAt, updatedAt },
    rules: filterRules,
  })

  const filterRulesLast: any = {
    search: {
      type: 'multiFieldSearch',
      multiFields: [
        { field: `name` },
        { field: `middleName` },
        { field: `lastName` },
        { field: `emails`, isArray: true, isArrayPrimitive: true },
        { field: `phones`, isArray: true, isArrayPrimitive: true },
      ],
    },
  }

  const queryLast = buildQuery({
    filters: { search },
    rules: filterRulesLast,
    removed: false,
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
      $match: queryLast,
    },
    {
      $facet: {
        clients: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const clientsRaw = await ClientModel.aggregate(pipeline).exec()

  const clients = clientsRaw[0].clients.map((doc: any) => ClientModel.hydrate(doc))
  const clientsCount = clientsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'CLIENTS_FETCHED', message: 'Clients fetched', clients, clientsCount }
}

export async function create(payload: ClientTypes.createClientParams): Promise<ClientTypes.createClientResult> {
  const client = await ClientModel.create(payload)

  return { status: 'success', code: 'CLIENT_CREATED', message: 'Client created', client }
}

export async function edit(payload: ClientTypes.editClientParams): Promise<ClientTypes.editClientResult> {
  const { id } = payload

  const client = await ClientModel.findOneAndUpdate({ _id: id }, payload)

  if (!client) {
    throw new HttpError(400, 'Client not edited', 'CLIENT_NOT_EDITED')
  }

  return { status: 'success', code: 'CLIENT_EDITED', message: 'Client edited', client }
}

export async function remove(payload: ClientTypes.removeClientsParams): Promise<ClientTypes.removeClientsResult> {
  const { ids } = payload

  const clients = await ClientModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!clients) {
    throw new HttpError(400, 'Clients not removed', 'CLIENTS_NOT_REMOVED')
  }

  return { status: 'success', code: 'CLIENTS_REMOVED', message: 'Clients removed' }
}
