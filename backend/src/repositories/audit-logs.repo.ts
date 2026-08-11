import type { AggregateResult, AuditLogPopulatedDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type { CreateAuditLogsRepoPayload, EditAuditLogsRepoPayload, GetAuditLogsRepoPayload, GetAuditLogsRepoResult } from '@/types'
import { AuditLogsModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetAuditLogsRepoPayload): Promise<GetAuditLogsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    ids,
    resourceType,
    resourceId,
    action,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: {
      _id: ids,
      resourceType,
      resourceId,
      action,
      createdAt,
      updatedAt,
    },
    rules: {
      _id: { type: 'array' },
      resourceType: { type: 'array' },
      resourceId: { type: 'array' },
      action: { type: 'array' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters, { createdAt: -1, _id: -1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
    {
      $facet: {
        items: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
          {
            $lookup: {
              from: 'products',
              localField: 'resourceId',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $lookup: {
              from: 'orders',
              localField: 'resourceId',
              foreignField: '_id',
              as: 'order',
            },
          },
          {
            $lookup: {
              from: 'barcodes',
              localField: 'resourceId',
              foreignField: '_id',
              as: 'barcode',
            },
          },
          {
            $lookup: {
              from: 'warehouse-transactions',
              localField: 'resourceId',
              foreignField: '_id',
              as: 'warehouseTransaction',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              as: 'createdBy',
            },
          },
          {
            $addFields: {
              resource: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$resourceType', 'product'] }, then: { $arrayElemAt: ['$product', 0] } },
                    { case: { $eq: ['$resourceType', 'order'] }, then: { $arrayElemAt: ['$order', 0] } },
                    { case: { $eq: ['$resourceType', 'barcode'] }, then: { $arrayElemAt: ['$barcode', 0] } },
                    { case: { $eq: ['$resourceType', 'warehouse-transaction'] }, then: { $arrayElemAt: ['$warehouseTransaction', 0] } },
                  ],
                  default: null,
                },
              },
            },
          },
          { $unset: ['product', 'order', 'barcode', 'warehouseTransaction'] },
          {
            $project: {
              _id: 0,
              id: { $toString: '$_id' },
              resourceType: 1,
              resourceId: { $toString: '$resourceId' },
              resource: 1,
              action: 1,
              changes: 1,
              comment: 1,
              createdBy: {
                $cond: [
                  { $gt: [{ $size: { $ifNull: ['$createdBy', []] } }, 0] },
                  {
                    $let: {
                      vars: { user: { $arrayElemAt: ['$createdBy', 0] } },
                      in: {
                        id: { $toString: '$$user._id' },
                        name: { $ifNull: ['$$user.name', ''] },
                      },
                    },
                  },
                  null,
                ],
              },
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        count: [{ $count: 'count' }],
      },
    },
  ]

  const raw = await AuditLogsModel.aggregate<AggregateResult<AuditLogPopulatedDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateAuditLogsRepoPayload) {
  return AuditLogsModel.create(payload)
}

export async function updateById(id: string, payload: EditAuditLogsRepoPayload) {
  return AuditLogsModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}
