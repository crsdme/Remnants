import { parseResponse } from 'test/helpers/parse-response'
import { createProductPropertyOptionResponseSchema, createProductPropertyResponseSchema, getProductPropertyOptionsResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as ProductPropertyOptionFactory from '../factories/product-property-option.factory'
import * as ProductPropertyFactory from '../factories/product-property.factory'

describe('API', () => {
  afterEach(async () => {
    await ProductPropertyOptionFactory.removeAll()
    await ProductPropertyFactory.removeAll()
  })

  describe('Get Product Property Options', () => {
    it('Schema validation', async () => {
      const productPropertyResponse = await ProductPropertyFactory.create({
        names: { en: 'Size', ru: 'Размер' },
        symbols: { en: 'Size', ru: 'Размер' },
        priority: 1,
        active: true,
        type: 'select',
        isRequired: true,
        showInTable: true,
        showInStatistics: true,
      })
      const productPropertyResponseParsed = parseResponse(createProductPropertyResponseSchema, productPropertyResponse)

      const productPropertyOptionResponse = await ProductPropertyOptionFactory.create({
        names: { en: 'Small', ru: 'Малый' },
        priority: 1,
        active: true,
        color: '#000000',
        productProperty: productPropertyResponseParsed.data.id,
      })
      const productPropertyOptionResponseParsed = parseResponse(createProductPropertyOptionResponseSchema, productPropertyOptionResponse)

      const response = await ProductPropertyOptionFactory.get()
      const parsed = parseResponse(getProductPropertyOptionsResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === productPropertyOptionResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: productPropertyOptionResponseParsed.data.id,
        names: { en: 'Small', ru: 'Малый' },
        priority: 1,
        active: true,
        color: '#000000',
        productProperty: productPropertyResponseParsed.data.id,
      })
    })
  })
})
