import { parseResponse } from 'test/helpers/parse-response'
import { createExpenseCategoryResponseSchema, getExpenseCategoriesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as ExpenseCategoryFactory from '../factories/expense-category.factory'

describe('exprense category API', () => {
  afterEach(async () => {
    await ExpenseCategoryFactory.removeAll()
  })

  describe('Get Exprense Categories', () => {
    it('Schema validation', async () => {
      const expenseCategoryResponse = await ExpenseCategoryFactory.create({
        names: { en: 'Taxes', ru: 'Налоги' },
        color: '#000000',
        priority: 1,
        comment: 'This is a test comment',
      })
      const expenseCategoryResponseParsed = parseResponse(createExpenseCategoryResponseSchema, expenseCategoryResponse)

      const response = await ExpenseCategoryFactory.get()
      const parsed = parseResponse(getExpenseCategoriesResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === expenseCategoryResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: expenseCategoryResponseParsed.data.id,
        names: { en: 'Taxes', ru: 'Налоги' },
        color: '#000000',
        priority: 1,
        comment: 'This is a test comment',
      })
    })
  })
})
