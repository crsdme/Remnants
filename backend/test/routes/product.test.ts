import { parseResponse } from 'test/helpers/parse-response'
import {
  createCategoryResponseSchema,
  createCurrencyResponseSchema,
  createProductPropertyGroupResponseSchema,
  createProductPropertyResponseSchema,
  createProductResponseSchema,
  createUnitResponseSchema,
  getProductsResponseSchema,
} from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as CategoryFactory from '../factories/category.factory'
import * as CurrencyFactory from '../factories/currency.factory'
import * as ProductPropertyGroupFactory from '../factories/product-property-group.factory'
import * as ProductPropertyFactory from '../factories/product-property.factory'
import * as ProductFactory from '../factories/product.factory'
import * as UnitFactory from '../factories/unit.factory'

describe('Product API', () => {
  afterEach(async () => {
    await ProductFactory.removeAll()
    await CurrencyFactory.removeAll()
    await UnitFactory.removeAll()
    await ProductPropertyGroupFactory.removeAll()
    await ProductPropertyFactory.removeAll()
    await CategoryFactory.removeAll()
  })

  describe('Get Products', () => {
    it('Schema validation', async () => {
      const currencyResponse = await CurrencyFactory.create({
        names: { en: 'USD', ru: 'USD' },
        symbols: { en: 'USD', ru: 'USD' },
        priority: 1,
        active: true,
      })
      const currencyResponseParsed = parseResponse(createCurrencyResponseSchema, currencyResponse)

      const unitResponse = await UnitFactory.create({
        names: { en: 'pcs', ru: 'шт' },
        symbols: { en: 'pcs', ru: 'шт' },
        priority: 1,
        active: true,
      })
      const unitResponseParsed = parseResponse(createUnitResponseSchema, unitResponse)

      const productPropertyGroupResponse = await ProductPropertyGroupFactory.create({
        names: { en: 'Product Properties Group 1', ru: 'Группа свойств продукта 1' },
        priority: 1,
        active: true,
      })
      const productPropertyGroupResponseParsed = parseResponse(createProductPropertyGroupResponseSchema, productPropertyGroupResponse)

      const productPropertyResponse = await ProductPropertyFactory.create({
        names: { en: 'Product Property 1', ru: 'Свойство продукта 1' },
        symbols: { en: 'Product Property 1', ru: 'Свойство продукта 1' },
        type: 'text',
        isRequired: true,
        showInTable: true,
        showInStatistics: true,
        priority: 1,
        active: true,
      })
      const productPropertyResponseParsed = parseResponse(createProductPropertyResponseSchema, productPropertyResponse)

      const categoryResponse = await CategoryFactory.create({
        names: { en: 'Category 1', ru: 'Категория 1' },
        priority: 1,
        active: true,
      })
      const categoryResponseParsed = parseResponse(createCategoryResponseSchema, categoryResponse)

      const productResponse = await ProductFactory.create({
        names: { en: 'Product 1', ru: 'Продукт 1' },
        price: 100,
        currency: currencyResponseParsed.data.id,
        purchasePrice: 50,
        purchaseCurrency: currencyResponseParsed.data.id,
        unit: unitResponseParsed.data.id,
        productPropertiesGroup: productPropertyGroupResponseParsed.data.id,
        productProperties: [{ id: productPropertyResponseParsed.data.id, value: 'value-1' }],
        categories: [categoryResponseParsed.data.id],
      })
      const productResponseParsed = parseResponse(createProductResponseSchema, productResponse)

      const response = await ProductFactory.get()
      const parsed = parseResponse(getProductsResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === productResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: productResponseParsed.data.id,
        names: { en: 'Product 1', ru: 'Продукт 1' },
        price: 100,
        currency: {
          id: currencyResponseParsed.data.id,
          names: { en: 'USD', ru: 'USD' },
          symbols: { en: 'USD', ru: 'USD' },
        },
        purchasePrice: 50,
        purchaseCurrency: {
          id: currencyResponseParsed.data.id,
          names: { en: 'USD', ru: 'USD' },
          symbols: { en: 'USD', ru: 'USD' },
        },
        unit: {
          id: unitResponseParsed.data.id,
          names: { en: 'pcs', ru: 'шт' },
          symbols: { en: 'pcs', ru: 'шт' },
        },
        productPropertiesGroup: {
          id: productPropertyGroupResponseParsed.data.id,
          names: { en: 'Product Properties Group 1', ru: 'Группа свойств продукта 1' },
        },
        productProperties: [{
          id: productPropertyResponseParsed.data.id,
          options: [],
          value: 'value-1',
        }],
        categories: [{
          id: categoryResponseParsed.data.id,
          names: { en: 'Category 1', ru: 'Категория 1' },
        }],
      })
    })
  })
})

// productProperties: [
//   {
//     value: 'value-1',
//     data: {
//       names: { ru: 'Свойство продукта 1', en: 'Product Property 1' },
//       symbols: { ru: 'Свойство продукта 1', en: 'Product Property 1' },
//       type: 'text',
//       isRequired: true,
//       showInTable: true
//     },
//     optionData: [],
//     id: 'd7a3fc1f-9eb8-4dbb-89c2-c67fcae81c3d'
//   }
// ],
