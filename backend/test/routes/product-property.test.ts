import { parseResponse } from 'test/helpers/parse-response'
import { createProductPropertyResponseSchema, getProductPropertiesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as ProductPropertyFactory from '../factories/product-property.factory'

describe('API', () => {
  afterEach(async () => {
    await ProductPropertyFactory.removeAll()
  })

  describe('Get Product Properties', () => {
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

      const response = await ProductPropertyFactory.get()
      const parsed = parseResponse(getProductPropertiesResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === productPropertyResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: productPropertyResponseParsed.data.id,
        names: { en: 'Size', ru: 'Размер' },
        symbols: { en: 'Size', ru: 'Размер' },
        priority: 1,
        active: true,
        type: 'select',
        isRequired: true,
        showInTable: true,
        showInStatistics: true,
      })
    })
  })
})
