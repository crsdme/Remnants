import { parseResponse } from 'test/helpers/parse-response'
import { createCategoryResponseSchema, getCategoriesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as CategoryFactory from '../factories/category.factory'

describe('category API', () => {
  afterEach(async () => {
    await CategoryFactory.removeAll()
  })

  describe('Get Categories', () => {
    it('Schema validation', async () => {
      const categoryResponse = await CategoryFactory.create({
        names: { en: 'Electronics', ru: 'Электроника' },
        priority: 1,
        parent: undefined,
        active: true,
      })
      const categoryResponseParsed = parseResponse(createCategoryResponseSchema, categoryResponse)

      const response = await CategoryFactory.get()
      const parsed = parseResponse(getCategoriesResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === categoryResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: categoryResponseParsed.data.id,
        names: { en: 'Electronics', ru: 'Электроника' },
        priority: 1,
        active: true,
      })
    })
  })
})
