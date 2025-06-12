import type * as ProductPropertyGroupTypes from '../types/product-property-group.type'
import { ProductPropertyGroupModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: ProductPropertyGroupTypes.getProductPropertyGroupsParams): Promise<ProductPropertyGroupTypes.getProductPropertyGroupsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination

  const {
    names = '',
    language = 'en',
    productProperties = undefined,
    active = undefined,
    priority = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters

  const sorters = buildSortQuery(payload.sorters)

  const filterRules = {
    names: { type: 'string', langAware: true },
    active: { type: 'array' },
    priority: { type: 'exact' },
    productProperties: { type: 'array' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { names, active, priority, productProperties, createdAt, updatedAt },
    rules: filterRules,
    language,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $lookup: {
        from: 'product-properties',
        localField: 'productProperties',
        foreignField: '_id',
        as: 'productProperties',
      },
    },
    {
      $set: {
        productProperties: {
          $sortArray: {
            input: '$productProperties',
            sortBy: { priority: 1 },
          },
        },
      },
    },
    {
      $facet: {
        productPropertyGroups: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const productPropertyGroupsRaw = await ProductPropertyGroupModel.aggregate(pipeline).exec()

  const productPropertyGroups = productPropertyGroupsRaw[0].productPropertyGroups.map((doc: any) => ProductPropertyGroupModel.hydrate(doc))
  const productPropertyGroupsCount = productPropertyGroupsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'PRODUCT_PROPERTY_GROUPS_FETCHED', message: 'Product property groups fetched', productPropertyGroups, productPropertyGroupsCount }
}

export async function create(payload: ProductPropertyGroupTypes.createProductPropertyGroupParams): Promise<ProductPropertyGroupTypes.createProductPropertyGroupResult> {
  const productPropertyGroup = await ProductPropertyGroupModel.create(payload)

  return { status: 'success', code: 'PRODUCT_PROPERTY_GROUP_CREATED', message: 'Product property group created', productPropertyGroup }
}

export async function edit(payload: ProductPropertyGroupTypes.editProductPropertyGroupParams): Promise<ProductPropertyGroupTypes.editProductPropertyGroupResult> {
  const { id } = payload

  const productPropertyGroup = await ProductPropertyGroupModel.findOneAndUpdate({ _id: id }, payload)

  if (!productPropertyGroup) {
    throw new HttpError(400, 'Product property group not edited', 'PRODUCT_PROPERTY_GROUP_NOT_EDITED')
  }

  return { status: 'success', code: 'PRODUCT_PROPERTY_GROUP_EDITED', message: 'Product property group edited', productPropertyGroup }
}

export async function remove(payload: ProductPropertyGroupTypes.removeProductPropertyGroupsParams): Promise<ProductPropertyGroupTypes.removeProductPropertyGroupsResult> {
  const { ids } = payload

  const productPropertyGroups = await ProductPropertyGroupModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!productPropertyGroups) {
    throw new HttpError(400, 'Product property groups not removed', 'PRODUCT_PROPERTY_GROUPS_NOT_REMOVED')
  }

  return { status: 'success', code: 'PRODUCT_PROPERTY_GROUPS_REMOVED', message: 'Product property groups removed' }
}
