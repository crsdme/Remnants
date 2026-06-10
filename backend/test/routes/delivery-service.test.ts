import { parseResponse } from 'test/helpers/parse-response'
import { createDeliveryServiceResponseSchema, getDeliveryServicesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as DeliveryServiceFactory from '../factories/delivery-service.factory'

describe('delivery service API', () => {
  afterEach(async () => {
    await DeliveryServiceFactory.removeAll()
  })

  describe('Get Delivery Services', () => {
    it('Schema validation', async () => {
      const deliveryServiceResponse = await DeliveryServiceFactory.create({
        names: { en: 'Nova Poshta', ru: 'Нова Пошта' },
        priority: 1,
        color: '#000000',
        type: 'novaposhta',
      })
      const deliveryServiceResponseParsed = parseResponse(createDeliveryServiceResponseSchema, deliveryServiceResponse)

      const response = await DeliveryServiceFactory.get()
      const parsed = parseResponse(getDeliveryServicesResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === deliveryServiceResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: deliveryServiceResponseParsed.data.id,
        names: { en: 'Nova Poshta', ru: 'Нова Пошта' },
        priority: 1,
        color: '#000000',
        type: 'novaposhta',
        active: true,
      })
    })
  })
})
