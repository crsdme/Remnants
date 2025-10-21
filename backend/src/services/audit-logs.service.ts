import type { PipelineStage } from 'mongoose'
import type * as AuditLogsTypes from '../types/audit-logs.type'
import { AuditLogsModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery } from '../utils/queryBuilder'

export async function get(payload: AuditLogsTypes.getAuditLogsParams): Promise<AuditLogsTypes.getAuditLogsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    ids = [],
    resourceType = [],
    resourceId = [],
    action = [],
    createdAt = { from: undefined, to: undefined },
    updatedAt = { from: undefined, to: undefined },
  } = payload.filters || {}

  const filterRules = {
    _id: { type: 'array' },
    resourceType: { type: 'array' },
    resourceId: { type: 'array' },
    action: { type: 'array' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { _id: ids, resourceType, resourceId, action, createdAt, updatedAt },
    rules: filterRules,
    removed: false,
  })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $facet: {
        product: [
          { $match: { resourceType: 'product' } },
          {
            $lookup: {
              from: 'products',
              localField: 'resourceId',
              foreignField: '_id',
              as: 'resource',
            },
          },
        ],
        order: [
          { $match: { resourceType: 'order' } },
          {
            $lookup: {
              from: 'orders',
              localField: 'resourceId',
              foreignField: '_id',
              as: 'resource',
            },
          },
        ],
      },
    },
    { $project: { merged: { $concatArrays: ['$product', '$order'] } } },
    { $unwind: '$merged' },
    { $replaceRoot: { newRoot: '$merged' } },
    { $unwind: '$resource' },
    {
      $facet: {
        auditLogs: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const auditLogsRaw = await AuditLogsModel.aggregate(pipeline).exec()

  const auditLogs = auditLogsRaw[0].auditLogs
  const auditLogsCount = auditLogsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'AUDIT_LOGS_FETCHED', message: 'Audit logs fetched', auditLogs, auditLogsCount }
}

export async function create(payload: AuditLogsTypes.createAuditLogsParams): Promise<AuditLogsTypes.createAuditLogsResult> {
  const auditLog = await AuditLogsModel.create(payload)

  return { status: 'success', code: 'AUDIT_LOG_CREATED', message: 'Audit log created', auditLog }
}

export async function edit(payload: AuditLogsTypes.editAuditLogsParams): Promise<AuditLogsTypes.editAuditLogsResult> {
  const { id } = payload

  const auditLog = await AuditLogsModel.findOneAndUpdate({ _id: id }, payload)

  if (!auditLog) {
    throw new HttpError(400, 'Audit log not edited', 'AUDIT_LOG_NOT_EDITED')
  }

  return { status: 'success', code: 'AUDIT_LOG_EDITED', message: 'Audit log edited', auditLog }
}
