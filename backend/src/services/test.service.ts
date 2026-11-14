import { CategoryModel, ProductModel } from '@/models'
import * as CurrencyRepository from '@/repositories/currencies.repo'
import * as ProductRepository from '@/repositories/products.repo'
import * as CategoryService from '@/services/category.service'
import { getHardcodeData, getInvoiceProductPrice, HttpError, INVENTORY_CATEGORY_NAMES, toMinor } from '@/utils'

function asOptionIds(value: unknown): string[] {
  if (Array.isArray(value))
    return value.filter((v): v is string => typeof v === 'string')
  if (typeof value === 'string')
    return [value]
  return []
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

    // lean ProductDB types props as `id`; mongoose stores `_id`
    const props = (product.productProperties ?? []) as Array<{ id?: string, _id?: string, value?: unknown }>
    const propId = (p: { id?: string, _id?: string }) => p._id ?? p.id
    const lengthProp = props.find(p => propId(p) === propertyIds.LENGTH)
    const weightProp = props.find(p => propId(p) === propertyIds.WEIGHT)
    const length = lengthProp?.value
    const weight = weightProp?.value

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

  throw new HttpError(400, 'Invalid action', 'INVALID_ACTION')
}
