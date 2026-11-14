import { CategoryModel, ProductModel } from '@/models'
import * as CurrencyRepository from '@/repositories/currencies.repo'
import * as ProductRepository from '@/repositories/products.repo'
import * as CategoryService from '@/services/category.service'
import {
  explainInventoryCategory,
  getHardcodeData,
  getInvoiceProductPrice,
  HttpError,
  INVENTORY_CATEGORY_NAMES,
  type InventoryCategoryMissReason,
  toMinor,
} from '@/utils'

function asOptionIds(value: unknown): string[] {
  if (Array.isArray(value))
    return value.filter((v): v is string => typeof v === 'string' && v !== '')
  if (typeof value === 'string' && value !== '')
    return [value]
  return []
}

function productProps(product: { productProperties?: unknown }) {
  return (product.productProperties ?? []) as Array<{ id?: string, _id?: string, value?: unknown }>
}

function propId(p: { id?: string, _id?: string }) {
  return p._id ?? p.id
}

async function recalculateProductPrices() {
  const { propertyIds, propertyGroups } = getHardcodeData()
  const products = await ProductModel.find({ removed: { $ne: true } })
    .select({ currencyId: 1, productPropertiesGroupId: 1, productProperties: 1, minorPrice: 1 })
    .lean()
    .exec()

  const currencyIds = [...new Set(products.map(p => p.currencyId))]
  const currencies = await CurrencyRepository.findByIds(currencyIds)
  const scaleById = new Map(currencies.map(c => [String(c._id), c.scale]))

  const ops: Parameters<typeof ProductRepository.bulkWrite>[0] = []

  for (const product of products) {
    if (product.productPropertiesGroupId === propertyGroups.services)
      continue

    const props = productProps(product)
    const length = props.find(p => propId(p) === propertyIds.LENGTH)?.value
    const weight = props.find(p => propId(p) === propertyIds.WEIGHT)?.value

    if (typeof length !== 'number' || typeof weight !== 'number' || weight <= 0)
      continue

    const typeIds = asOptionIds(props.find(p => propId(p) === propertyIds.HAIR_TYPE)?.value)
    const segmentIds = asOptionIds(props.find(p => propId(p) === propertyIds.SEGMENT)?.value)
    const colorCategoryIds = asOptionIds(props.find(p => propId(p) === propertyIds.COLOR_CATEGORY)?.value)

    const perKg = getInvoiceProductPrice(length, typeIds, segmentIds, colorCategoryIds)
    if (perKg == null)
      continue

    const scale = scaleById.get(product.currencyId)
    if (scale === undefined)
      continue

    // Invoice price is per kg; product.price is absolute for this unit's weight.
    // No fractional major units: .5 and any remainder round up.
    const minorPrice = toMinor(Math.ceil(perKg * weight / 1000), scale)
    if (minorPrice === product.minorPrice)
      continue

    ops.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { minorPrice } },
      },
    })
  }

  if (ops.length > 0)
    await ProductRepository.bulkWrite(ops)

  return { updated: ops.length, total: products.length }
}

async function createInventoryCategories() {
  const existing = await CategoryModel.find({
    'names.en': { $in: [...INVENTORY_CATEGORY_NAMES] },
    removed: { $ne: true },
  }).select({ names: 1 }).lean().exec()

  const existingNames = new Set(
    existing.map((doc) => {
      const names = doc.names as Map<string, string> | Record<string, string>
      if (names instanceof Map)
        return names.get('en')
      return names?.en
    }).filter((name): name is string => typeof name === 'string'),
  )

  let created = 0
  for (const [i, name] of INVENTORY_CATEGORY_NAMES.entries()) {
    if (existingNames.has(name))
      continue

    await CategoryService.create({
      payload: {
        names: { en: name, ru: name, ua: name },
        priority: i + 1,
        active: true,
      },
    })
    created++
  }

  return {
    created,
    skipped: INVENTORY_CATEGORY_NAMES.length - created,
    total: INVENTORY_CATEGORY_NAMES.length,
  }
}

async function addProductCategories() {
  // TEMP: strip legacy length-as-category ids + soft-remove those docs — delete later
  const legacyCategoryIds = [
    'ec016440-5e2c-45c1-b3ac-92c14cdc3fb1',
    'd2f14204-ae1f-46b0-a89f-e2768ae707d9',
    '0c5d4f68-a993-4eed-ab67-736e4cd3f47f',
    'a9df2aa1-8338-42e0-afc8-497320c7f1e5',
    '726e6d4e-b066-486b-877f-5885528e868a',
    '58e1d38b-502d-4cc6-8d9a-44a9f64289d7',
    '86a08712-4d85-453c-bad1-98c098841163',
    '17dfb0a0-ea23-4152-b7b2-d54d63a49e7c',
    'dd904594-feaf-4f93-9b38-33d521e463f5',
    'e41f0080-cfc2-4dc4-874d-d994320babd6',
    'baeef84f-acb2-4d5e-a5ac-abe7cf0a7f80',
    '6565143f-e160-4fd8-9ea2-12b58a2d0c4b',
    'a3b85e8b-1485-4f2a-80c6-70ae8fa05865',
    '6e067a1d-6729-4429-885d-d0cda2475fc5',
    'f691c301-d7ab-4e3d-bc30-37e8d3567e82',
    '1f45e1bb-9715-490e-bac3-046688b0dc2a',
    'ee7771b0-2bde-46d3-a4a8-702324d57fc0',
    '58ee2880-c8ad-4ef5-9151-76ea6477c450',
    'b68b2155-21e6-47aa-8712-bb0a6ec96e3d',
    'd5556940-d6c0-44d0-9172-7ee7d79272ea',
  ]
  const pullResult = await ProductModel.updateMany(
    { categoryIds: { $in: legacyCategoryIds } },
    { $pull: { categoryIds: { $in: legacyCategoryIds } } },
  )
  const removeResult = await CategoryModel.updateMany(
    { _id: { $in: legacyCategoryIds } },
    { $set: { removed: true } },
  )

  const { propertyIds, propertyGroups, hairTypes } = getHardcodeData()
  const hairTypeNameById = Object.fromEntries(
    Object.entries(hairTypes).map(([name, id]) => [id, name]),
  )

  const products = await ProductModel.find({ removed: { $ne: true } })
    .select({ seq: 1, names: 1, productPropertiesGroupId: 1, productProperties: 1, categoryIds: 1 })
    .lean()
    .exec()

  const ops: Parameters<typeof ProductRepository.bulkWrite>[0] = []
  let matched = 0
  let unmatched = 0
  const reasons: Record<string, number> = {}
  const samples: Record<string, Array<{ seq?: number, id: string, name: string, length?: number, types: string[], group: string }>> = {}

  for (const product of products) {
    const props = productProps(product)
    const lengthRaw = props.find(p => propId(p) === propertyIds.LENGTH)?.value
    const length = typeof lengthRaw === 'number' ? lengthRaw : undefined
    const typeIds = asOptionIds(props.find(p => propId(p) === propertyIds.HAIR_TYPE)?.value)
    const segmentIds = asOptionIds(props.find(p => propId(p) === propertyIds.SEGMENT)?.value)
    const colorCategoryIds = asOptionIds(props.find(p => propId(p) === propertyIds.COLOR_CATEGORY)?.value)

    const explained = explainInventoryCategory({
      groupId: product.productPropertiesGroupId,
      length,
      typeIds,
      segmentIds,
      colorCategoryIds,
    })

    if (explained.reason === 'matched') {
      matched++
    }
    else {
      unmatched++
      reasons[explained.reason] = (reasons[explained.reason] ?? 0) + 1
      const list = samples[explained.reason] ?? (samples[explained.reason] = [])
      if (list.length < 8) {
        const names = product.names as Map<string, string> | Record<string, string> | undefined
        const name = names instanceof Map
          ? (names.get('en') ?? names.get('ru') ?? '')
          : (names?.en ?? names?.ru ?? '')
        const group
          = product.productPropertiesGroupId === propertyGroups.raw
            ? 'raw'
            : product.productPropertiesGroupId === propertyGroups.dyed
              ? 'dyed'
              : product.productPropertiesGroupId === propertyGroups.services
                ? 'services'
                : (product.productPropertiesGroupId ?? 'none')
        list.push({
          seq: product.seq,
          id: String(product._id),
          name,
          length,
          types: typeIds.map(id => hairTypeNameById[id] ?? id.slice(0, 8)),
          group,
        })
      }
    }

    const current = product.categoryIds ?? []
    if (current.length === 1 && current[0] === explained.categoryId)
      continue

    ops.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { categoryIds: [explained.categoryId] } },
      },
    })
  }

  if (ops.length > 0)
    await ProductRepository.bulkWrite(ops)

  console.log(`[addProductCategories] ${JSON.stringify({
    matched,
    unmatched,
    updated: ops.length,
    total: products.length,
    legacyPulled: pullResult.modifiedCount,
    legacyRemoved: removeResult.modifiedCount,
    reasons: reasons as Partial<Record<InventoryCategoryMissReason, number>>,
    samples,
  }, null, 2)}`)

  const reasonSummary = Object.entries(reasons)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `${reason}=${count}`)
    .join(', ')

  return {
    matched,
    unmatched,
    updated: ops.length,
    total: products.length,
    reasonSummary,
    legacyPulled: pullResult.modifiedCount,
    legacyRemoved: removeResult.modifiedCount,
  }
}

export async function start(payload: { key: string }) {
  if (payload.key === 'recalculateProductPrices') {
    const result = await recalculateProductPrices()
    return {
      status: 'success' as const,
      code: 'TEST',
      message: `updated ${result.updated} of ${result.total}`,
    }
  }

  if (payload.key === 'createInventoryCategories') {
    const result = await createInventoryCategories()
    return {
      status: 'success' as const,
      code: 'TEST',
      message: `created ${result.created}, skipped ${result.skipped}, total ${result.total}`,
    }
  }

  if (payload.key === 'addProductCategories') {
    const result = await addProductCategories()
    return {
      status: 'success' as const,
      code: 'TEST',
      message: `updated ${result.updated}, matched ${result.matched}, unmatched ${result.unmatched}, total ${result.total}; ${result.reasonSummary}`,
    }
  }

  throw new HttpError(400, 'Invalid action', 'INVALID_ACTION')
}
