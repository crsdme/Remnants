import { parseResponse } from 'test/helpers/parse-response'
import { createProductStockStatusResponseSchema, getProductStockStatusesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as ProductStockStatusFactory from '../factories/product-stock-status.factory'

describe('product stock status API', () => {
  afterEach(async () => {
    await ProductStockStatusFactory.removeAll()
  })

  describe('Get Product Stock Statuses', () => {
    it('Schema validation', async () => {
      const createResponse = await ProductStockStatusFactory.create({
        names: { en: 'Low stock', ru: 'Мало' },
        priority: 2,
        color: '#f97316',
        active: true,
        isDefault: false,
        conditions: [{ field: 'qty', operator: 'lte', value: 2 }],
      })
      const createParsed = parseResponse(createProductStockStatusResponseSchema, createResponse)

      const response = await ProductStockStatusFactory.get()
      const parsed = parseResponse(getProductStockStatusesResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === createParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: createParsed.data.id,
        names: { en: 'Low stock', ru: 'Мало' },
        color: '#f97316',
        priority: 2,
        active: true,
        isDefault: false,
        conditions: [{ field: 'qty', operator: 'lte', value: 2 }],
      })
    })
  })
})
