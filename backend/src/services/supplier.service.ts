import type {
  CreateSupplierParams,
  CreateSupplierResponse,
  EditSupplierParams,
  EditSupplierResponse,
  GetSuppliersParams,
  GetSuppliersResponse,
  RemoveSuppliersParams,
  RemoveSuppliersResponse,
} from '@remnant/shared'
import { SupplierModel } from '@/models/'
import { buildQuery, buildSortQuery, HttpError } from '@/utils/'

export async function get(payload: GetSuppliersParams): Promise<GetSuppliersResponse> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    ids = [],
    search = '',
    emails = [],
    phones = [],
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
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { _id: ids, emails, phones, createdAt, updatedAt },
    rules: filterRules,
  })

  const filterRulesLast: any = {
    search: {
      type: 'multiFieldSearch',
      multiFields: [
        { field: `name` },
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
        suppliers: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const suppliersRaw = await SupplierModel.aggregate(pipeline).exec()

  const suppliers = suppliersRaw[0].suppliers.map((doc: any) => SupplierModel.hydrate(doc))
  const suppliersCount = suppliersRaw[0].totalCount[0]?.count || 0

  return {
    status: 'success',
    code: 'SUPPLIERS_FETCHED',
    message: 'Suppliers fetched',
    data: {
      items: suppliers,
      pagination: {
        page: current,
        pageSize,
        total: suppliersCount,
      },
    },
  }
}

export async function create(payload: CreateSupplierParams): Promise<CreateSupplierResponse> {
  const supplier = await SupplierModel.create(payload)

  return {
    status: 'success',
    code: 'SUPPLIER_CREATED',
    message: 'Supplier created',
    data: supplier,
  }
}

export async function edit(payload: EditSupplierParams): Promise<EditSupplierResponse> {
  const { id } = payload

  const supplier = await SupplierModel.findOneAndUpdate({ _id: id }, payload)

  if (!supplier) {
    throw new HttpError(400, 'Supplier not edited', 'SUPPLIER_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'SUPPLIER_EDITED',
    message: 'Supplier edited',
    data: supplier,
  }
}

export async function remove(payload: RemoveSuppliersParams): Promise<RemoveSuppliersResponse> {
  const { ids } = payload

  const suppliers = await SupplierModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!suppliers) {
    throw new HttpError(400, 'Suppliers not removed', 'SUPPLIERS_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'SUPPLIERS_REMOVED',
    message: 'Suppliers removed',
  }
}
