import { parseResponse } from 'test/helpers/parse-response'
import { createCashregisterAccountResponseSchema, createCashregisterResponseSchema, createCurrencyResponseSchema, getCashregistersResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as CashregisterAccountFactory from '../factories/cashregister-account.factory'
import * as CashregisterFactory from '../factories/cashregister.factory'
import * as CurrencyFactory from '../factories/currency.factory'

describe('cashregister API', () => {
  afterEach(async () => {
    await CashregisterFactory.removeAll()
  })

  describe('Get Cashregisters', () => {
    it('Schema validation', async () => {
      // const currencyResponse = await CurrencyFactory.create({
      //   names: { en: 'Currency 1', ru: 'Currency 1' },
      //   symbols: { en: 'USD', ru: 'USD' },
      //   scale: 2,
      //   priority: 1,
      //   active: true,
      // })
      // const currencyResponseParsed = parseResponse(createCurrencyResponseSchema, currencyResponse)

      // const accountResponse = await CashregisterAccountFactory.create({
      //   names: { en: 'Account 1', ru: 'Account 1' },
      //   priority: 1,
      //   currencies: [currencyResponseParsed.data.id],
      //   active: true,
      // })
      // const accountResponseParsed = parseResponse(createCashregisterAccountResponseSchema, accountResponse)

      // const cashregisterResponse = await CashregisterFactory.create({
      //   names: { en: 'Cashregister 1', ru: 'Cashregister 1' },
      //   priority: 1,
      //   accounts: [accountResponseParsed.data.id],
      //   active: true,
      // })
      // const cashregisterResponseParsed = parseResponse(createCashregisterResponseSchema, cashregisterResponse)

      // const response = await CashregisterFactory.get()
      // const parsed = parseResponse(getCashregistersResponseSchema, response)

      // expect(parsed.data.items.length).toBeGreaterThan(0)
      // expect(parsed.data.pagination.total).toBeGreaterThan(0)

      // const found = parsed.data.items.find(item => item.id === cashregisterResponseParsed.data.id)

      // expect(found).toBeDefined()
      // expect(found).toMatchObject({
      //   id: cashregisterResponseParsed.data.id,
      //   names: { en: 'Cashregister 1', ru: 'Cashregister 1' },
      //   priority: 1,
      //   accounts: [{
      //     id: accountResponseParsed.data.id,
      //     seq: accountResponseParsed.data.seq,
      //     names: accountResponseParsed.data.names,
      //     currencies: [{
      //       id: currencyResponseParsed.data.id,
      //       names: currencyResponseParsed.data.names,
      //       symbols: currencyResponseParsed.data.symbols,
      //     }],
      //     priority: accountResponseParsed.data.priority,
      //     active: accountResponseParsed.data.active,
      //   }],
      //   active: true,
      // })
    })
  })
})
