import { parseResponse } from 'test/helpers/parse-response'
import { createOrderStatusResponseSchema, getOrderStatusesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as OrderStatusFactory from '../factories/order-status.factory'

describe('order status API', () => {
  afterEach(async () => {
    await OrderStatusFactory.removeAll()
  })

  describe('Get Order Statuses', () => {
    it('Schema validation', async () => {
      const orderStatusResponse = await OrderStatusFactory.create({
        names: { en: 'New', ru: 'Новый' },
        priority: 1,
        color: '#000000',
        isLocked: true,
        isSelectable: true,
      })
      const orderStatusResponseParsed = parseResponse(createOrderStatusResponseSchema, orderStatusResponse)

      const response = await OrderStatusFactory.get()
      const parsed = parseResponse(getOrderStatusesResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === orderStatusResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: orderStatusResponseParsed.data.id,
        names: { en: 'New', ru: 'Новый' },
        color: '#000000',
        priority: 1,
        isLocked: true,
        isSelectable: true,
      })
    })
  })
})
