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
        credentials: {
          type: 'novaposhta',
          apiKey: 'test-api-key-123456',
          phone: '380671112233',
          sender: {
            city: { id: 'city-ref', name: 'Kyiv' },
            office: { id: 'office-ref', name: 'Warehouse 1' },
          },
        },
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
      expect(found?.credentials).toMatchObject({
        type: 'novaposhta',
        phone: '380671112233',
        hasApiKey: true,
        sender: {
          city: { id: 'city-ref', name: 'Kyiv' },
          office: { id: 'office-ref', name: 'Warehouse 1' },
        },
      })
      expect(found?.credentials?.type === 'novaposhta' && found.credentials.apiKey).not.toBe('test-api-key-123456')
    })
  })
})
