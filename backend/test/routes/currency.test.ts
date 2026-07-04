import { parseResponse } from 'test/helpers/parse-response'
import { createCurrencyResponseSchema, getCurrenciesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as CurrencyFactory from '../factories/currency.factory'

describe('currency API', () => {
  afterEach(async () => {
    await CurrencyFactory.removeAll()
  })

  describe('Get Currencies', () => {
    it('Schema validation', async () => {
      const currencyResponse = await CurrencyFactory.create({
        names: { en: 'Dollar', ru: 'Доллар' },
        symbols: { en: 'USD', ru: 'USD' },
        scale: 2,
        paymentEpsilon: 0.1,
        priority: 1,
        active: true,
      })
      const currencyResponseParsed = parseResponse(createCurrencyResponseSchema, currencyResponse)

      const response = await CurrencyFactory.get()
      const parsed = parseResponse(getCurrenciesResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === currencyResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: currencyResponseParsed.data.id,
        names: { en: 'Dollar', ru: 'Доллар' },
        symbols: { en: 'USD', ru: 'USD' },
        scale: 2,
        paymentEpsilon: 0.1,
        priority: 1,
        active: true,
      })
    })
  })
})
