import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseResponse } from 'test/helpers/parse-response'
import {
  createCategoryResponseSchema,
  createCurrencyResponseSchema,
  createProductPropertyGroupResponseSchema,
  createUnitResponseSchema,
  importProductsResponseSchema,
  previewImportProductsResponseSchema,
} from '@remnant/shared'
import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import app from '@/index'
import { ProductModel } from '@/models/product.model'
import * as CategoryFactory from '../factories/category.factory'
import * as CurrencyFactory from '../factories/currency.factory'
import * as ProductPropertyGroupFactory from '../factories/product-property-group.factory'
import * as ProductFactory from '../factories/product.factory'
import * as UnitFactory from '../factories/unit.factory'

function writeCsv(rows: string[]): string {
  const filePath = path.join(os.tmpdir(), `product-import-${Date.now()}.csv`)
  fs.writeFileSync(filePath, `${rows.join('\n')}\n`, 'utf8')
  return filePath
}

describe('product import API', () => {
  afterEach(async () => {
    await ProductFactory.removeAll()
    await CategoryFactory.removeAll()
    await CurrencyFactory.removeAll()
    await UnitFactory.removeAll()
    await ProductPropertyGroupFactory.removeAll()
  })

  it('previews valid and invalid rows, then imports only valid ones', async () => {
    const currency = parseResponse(createCurrencyResponseSchema, await CurrencyFactory.create({
      names: { en: 'USD', ru: 'USD' },
      symbols: { en: '$', ru: '$' },
      scale: 2,
      priority: 1,
      active: true,
    }))
    const unit = parseResponse(createUnitResponseSchema, await UnitFactory.create({
      names: { en: 'Piece', ru: 'Штука' },
      symbols: { en: 'pcs', ru: 'шт' },
      priority: 1,
      active: true,
    }))
    const category = parseResponse(createCategoryResponseSchema, await CategoryFactory.create({
      names: { en: 'General', ru: 'Общее' },
      priority: 1,
      active: true,
    }))
    const group = parseResponse(createProductPropertyGroupResponseSchema, await ProductPropertyGroupFactory.create({
      names: { en: 'Default', ru: 'По умолчанию' },
      priority: 1,
      active: true,
    }))

    const currencyRef = `USD (${currency.data.id})`
    const unitRef = `Piece (${unit.data.id})`
    const categoryRef = `General (${category.data.id})`
    const groupRef = `Default (${group.data.id})`

    const csvPath = writeCsv([
      'name_en,name_ru,price,purchasePrice,currency,purchaseCurrency,unit,productPropertiesGroup,categories_0,generateBarcode',
      `Valid Product,Валидный,10,5,${currencyRef},${currencyRef},${unitRef},${groupRef},${categoryRef},false`,
      `,,,,${currencyRef},${currencyRef},${unitRef},${groupRef},${categoryRef},false`,
    ])

    const previewResponse = await request(app)
      .post('/api/products/import/preview')
      .attach('file', csvPath)

    const preview = parseResponse(previewImportProductsResponseSchema, previewResponse.body)
    expect(preview.data.summary).toEqual({ total: 2, valid: 1, invalid: 1 })
    expect(preview.data.rows[0].status).toBe('valid')
    expect(preview.data.rows[1].status).toBe('invalid')
    expect(preview.data.rows[1].errors).toContain('MISSING_NAMES')

    const importResponse = await request(app)
      .post('/api/products/import')
      .field('isAutoSyncEnabled', 'false')
      .field('syncSites', '[]')
      .attach('file', csvPath)

    const imported = parseResponse(importProductsResponseSchema, importResponse.body)
    expect(imported.data).toEqual({
      created: 1,
      updated: 0,
      skipped: 1,
      synced: 0,
      failed: 0,
    })

    const products = await ProductModel.find({
      removed: { $ne: true },
      'names.en': 'Valid Product',
    }).lean().exec()
    expect(products).toHaveLength(1)
    expect(products[0].names).toMatchObject({ en: 'Valid Product', ru: 'Валидный' })

    fs.unlinkSync(csvPath)
  })
})
