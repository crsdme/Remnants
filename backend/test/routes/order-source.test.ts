import { parseResponse } from 'test/helpers/parse-response'
import { createOrderSourceResponseSchema, getOrderSourcesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as OrderSourceFactory from '../factories/order-source.factory'

describe('order source API', () => {
  afterEach(async () => {
    await OrderSourceFactory.removeAll()
  })

  describe('Get Order Sources', () => {
    it('Schema validation', async () => {
      const orderSourceResponse = await OrderSourceFactory.create({
        names: { en: 'Website', ru: 'Веб-сайт' },
        priority: 1,
        color: '#000000',
      })
      const orderSourceResponseParsed = parseResponse(createOrderSourceResponseSchema, orderSourceResponse)

      const response = await OrderSourceFactory.get()
      const parsed = parseResponse(getOrderSourcesResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === orderSourceResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: orderSourceResponseParsed.data.id,
        names: { en: 'Website', ru: 'Веб-сайт' },
        color: '#000000',
        priority: 1,
      })
    })
  })
})
