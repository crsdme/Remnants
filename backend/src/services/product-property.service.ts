import type * as ProductPropertyTypes from '../types/product-property.type'
import { ProductPropertyModel } from '../models/product-property.model'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: ProductPropertyTypes.getProductPropertiesParams): Promise<ProductPropertyTypes.getProductPropertiesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination

  const {
    ids = [],
    names = '',
    language = 'en',
    options = undefined,
    type = undefined,
    priority = undefined,
    active = undefined,
    showInTable = undefined,
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
    _id: { type: 'array' },
    names: { type: 'string', langAware: true },
    active: { type: 'array' },
    options: { type: 'array' },
    type: { type: 'exact' },
    priority: { type: 'exact' },
    showInTable: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { _id: ids, names, options, type, priority, active, showInTable, createdAt, updatedAt },
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
      $facet: {
        productProperties: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const productPropertiesRaw = await ProductPropertyModel.aggregate(pipeline).exec()

  const productProperties = productPropertiesRaw[0].productProperties.map((doc: any) => ProductPropertyModel.hydrate(doc))
  const productPropertiesCount = productPropertiesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'PRODUCT_PROPERTIES_FETCHED', message: 'Product properties fetched', productProperties, productPropertiesCount }
}

export async function create(payload: ProductPropertyTypes.createProductPropertyParams): Promise<ProductPropertyTypes.createProductPropertyResult> {
  const productProperty = await ProductPropertyModel.create(payload)

  return { status: 'success', code: 'PRODUCT_PROPERTY_CREATED', message: 'Product property created', productProperty }
}

export async function edit(payload: ProductPropertyTypes.editProductPropertyParams): Promise<ProductPropertyTypes.editProductPropertyResult> {
  const { id } = payload

  const productProperty = await ProductPropertyModel.findOneAndUpdate({ _id: id }, payload)

  if (!productProperty) {
    throw new HttpError(400, 'Product property not edited', 'PRODUCT_PROPERTY_NOT_EDITED')
  }

  return { status: 'success', code: 'PRODUCT_PROPERTY_EDITED', message: 'Product property edited', productProperty }
}

export async function remove(payload: ProductPropertyTypes.removeProductPropertiesParams): Promise<ProductPropertyTypes.removeProductPropertiesResult> {
  const { ids } = payload

  const productProperties = await ProductPropertyModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!productProperties) {
    throw new HttpError(400, 'Product properties not removed', 'PRODUCT_PROPERTIES_NOT_REMOVED')
  }

  return { status: 'success', code: 'PRODUCT_PROPERTIES_REMOVED', message: 'Product properties removed' }
}
