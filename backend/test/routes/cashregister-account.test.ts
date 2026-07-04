import { parseResponse } from 'test/helpers/parse-response'
import { createCashregisterAccountResponseSchema, createCurrencyResponseSchema, getCashregisterAccountsResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as CashregisterAccountFactory from '../factories/cashregister-account.factory'
import * as CurrencyFactory from '../factories/currency.factory'

describe('cashregister account API', () => {
  afterEach(async () => {
    await CashregisterAccountFactory.removeAll()
  })

  describe('Get Cashregister Accounts', () => {
    it('Schema validation', async () => {
      const currencyResponse = await CurrencyFactory.create({
        names: { en: 'Dollar', ru: 'Доллар' },
        symbols: { en: 'USD', ru: 'USD' },
        scale: 2,
        priority: 1,
        active: true,
      })
      const currencyResponseParsed = parseResponse(createCurrencyResponseSchema, currencyResponse)

      const accountResponse = await CashregisterAccountFactory.create({
        names: { en: 'Cash', ru: 'Наличные' },
        priority: 1,
        currencies: [currencyResponseParsed.data.id],
        active: true,
      })
      const accountResponseParsed = parseResponse(createCashregisterAccountResponseSchema, accountResponse)

      const response = await CashregisterAccountFactory.get()
      const parsed = parseResponse(getCashregisterAccountsResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === accountResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: accountResponseParsed.data.id,
        seq: accountResponseParsed.data.seq,
        names: { en: 'Cash', ru: 'Наличные' },
        priority: 1,
        currencies: [{
          id: currencyResponseParsed.data.id,
          names: currencyResponseParsed.data.names,
          symbols: currencyResponseParsed.data.symbols,
        }],
        active: true,
      })
    })
  })
})
