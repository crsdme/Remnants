import type {
  CreateProductPropertyOptionParams,
  CreateProductPropertyOptionResponse,
  EditProductPropertyOptionParams,
  EditProductPropertyOptionResponse,
  GetProductPropertyOptionsParams,
  GetProductPropertyOptionsResponse,
  RemoveProductPropertyOptionsParams,
  RemoveProductPropertyOptionsResponse,
} from '@remnant/shared'
import { ProductPropertyModel, ProductPropertyOptionModel } from '@/models/'
import { buildQuery, buildSortQuery, HttpError } from '@/utils/'

export async function get(payload: GetProductPropertyOptionsParams): Promise<GetProductPropertyOptionsResponse> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    ids = [],
    names = '',
    language = 'en',
    priority = undefined,
    active = undefined,
    productProperty = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters || {}

  const sorters = buildSortQuery(payload.sorters || {}, { priority: 1 })

  const filterRules = {
    _id: { type: 'array' },
    names: { type: 'string', langAware: true },
    active: { type: 'array' },
    priority: { type: 'exact' },
    productProperty: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { _id: ids, names, priority, active, createdAt, updatedAt, productProperty },
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
        documents: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const productPropertiesOptionsRaw = await ProductPropertyOptionModel.aggregate(pipeline).exec()

  const productPropertiesOptions = productPropertiesOptionsRaw[0].documents.map((doc: any) => ProductPropertyOptionModel.hydrate(doc))
  const productPropertiesOptionsCount = productPropertiesOptionsRaw[0].totalCount[0]?.count || 0

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_OPTIONS_FETCHED',
    message: 'Product property options fetched',
    data: {
      items: productPropertiesOptions,
      pagination: {
        page: current,
        pageSize,
        total: productPropertiesOptionsCount,
      },
    },
  }
}

export async function create(payload: CreateProductPropertyOptionParams): Promise<CreateProductPropertyOptionResponse> {
  const productPropertyOption = await ProductPropertyOptionModel.create(payload)

  await ProductPropertyModel.updateOne({ _id: payload.productProperty }, { $push: { options: productPropertyOption._id } })

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_OPTION_CREATED',
    message: 'Product property option created',
    data: productPropertyOption,
  }
}

export async function edit(payload: EditProductPropertyOptionParams): Promise<EditProductPropertyOptionResponse> {
  const { id } = payload

  const productPropertyOption = await ProductPropertyOptionModel.findOneAndUpdate({ _id: id }, payload)

  if (!productPropertyOption) {
    throw new HttpError(400, 'Product property option not edited', 'PRODUCT_PROPERTY_OPTION_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_OPTION_EDITED',
    message: 'Product property option edited',
    data: productPropertyOption,
  }
}

export async function remove(payload: RemoveProductPropertyOptionsParams): Promise<RemoveProductPropertyOptionsResponse> {
  const { ids } = payload

  const productPropertyOptions = await ProductPropertyOptionModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  await ProductPropertyModel.updateMany(
    { options: { $in: ids } },
    { $pull: { options: { $in: ids } } },
  )

  if (!productPropertyOptions) {
    throw new HttpError(400, 'Product property options not removed', 'PRODUCT_PROPERTY_OPTIONS_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_OPTIONS_REMOVED',
    message: 'Product property options removed',
  }
}
