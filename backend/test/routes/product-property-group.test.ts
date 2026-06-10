import { parseResponse } from 'test/helpers/parse-response'
import { createProductPropertyGroupResponseSchema, getProductPropertyGroupsResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as ProductPropertyGroupFactory from '../factories/product-property-group.factory'

describe('API', () => {
  afterEach(async () => {
    await ProductPropertyGroupFactory.removeAll()
  })

  describe('Get Product Property Groups', () => {
    it('Schema validation', async () => {
      const productPropertyGroupResponse = await ProductPropertyGroupFactory.create({
        names: { en: 'Color', ru: 'Цвет' },
        priority: 1,
        active: true,
      })
      const productPropertyGroupResponseParsed = parseResponse(createProductPropertyGroupResponseSchema, productPropertyGroupResponse)

      const response = await ProductPropertyGroupFactory.get()
      const parsed = parseResponse(getProductPropertyGroupsResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === productPropertyGroupResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: productPropertyGroupResponseParsed.data.id,
        names: { en: 'Color', ru: 'Цвет' },
        priority: 1,
        active: true,
      })
    })
  })
})
