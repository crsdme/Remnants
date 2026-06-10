import { parseResponse } from 'test/helpers/parse-response'
import { createQuantitiesResponseSchema, getQuantitiesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as QuantityFactory from '../factories/quantity.factory'

describe('quantity API', () => {
  afterEach(async () => {
    await QuantityFactory.removeAll()
  })

  describe('Get Quantities', () => {
    it('Schema validation', async () => {
      // const quantityResponse = await QuantityFactory.create({
      //   count: 10,
      //   warehouse: '123',
      //   productId: '123',
      // })
      // const quantityResponseParsed = parseResponse(createQuantitiesResponseSchema, quantityResponse)

      // const response = await QuantityFactory.get()
      // const parsed = parseResponse(getQuantitiesResponseSchema, response)

      // expect(parsed.data.items.length).toBeGreaterThan(0)
      // expect(parsed.data.pagination.total).toBeGreaterThan(0)

      // const found = parsed.data.items.find(item => item.id === quantityResponseParsed.data.id)

      // expect(found).toBeDefined()
      // expect(found).toMatchObject({
      //   id: quantityResponseParsed.data.id,
      //   count: 10,
      //   warehouse: '123',
      //   productId: '123',
      //   status: 'available',
      // })
    })
  })
})
