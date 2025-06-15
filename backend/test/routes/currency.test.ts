import { afterEach, describe, expect, it } from 'vitest'
import * as CurrencyFactory from '../factories/currency.factory'
import { expectValidationError } from '../helpers/expectValidationError'

describe('currency API', () => {
  afterEach(async () => {
    await CurrencyFactory.removeAll()
  })

  describe('Create Currency', () => {
    it('should create a currency', async () => {
      const res = await CurrencyFactory.create()
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('currency')
    })
  })

  describe('Get Currencies', () => {
    it('should return list of currencies', async () => {
      await CurrencyFactory.create()
      const res = await CurrencyFactory.get()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('currencies')
      expect(res.body).toHaveProperty('currenciesCount')

      const { currencies, currenciesCount } = res.body

      expect(Array.isArray(currencies)).toBe(true)
      expect(currencies.length).toBeGreaterThan(0)

      const found = currencies.find((currency: any) => currency.names.en === 'Dollar')
      expect(found).toBeDefined()
      expect(currenciesCount).toBeGreaterThan(0)
    })
  })

  describe('Edit Currency', () => {
    it('should edit a currency', async () => {
      const params = {
        id: null,
        names: {
          en: 'Dollar Edited',
          ru: 'Доллар Изменен',
        },
        symbols: {
          en: 'USDE',
          ru: 'USDE',
        },
        priority: 2,
        active: false,
      }

      const createdCurrency = await CurrencyFactory.create(params)
      params.id = createdCurrency.body.currency.id

      const res = await CurrencyFactory.edit(params)

      expect(res.status).toBe(200)
      expect(res.body.currency).toMatchObject(params)
    })
  })

  describe('Remove Currency', () => {
    it('should remove a currency', async () => {
      const createdCurrency = await CurrencyFactory.create()
      const createdCurrencyId = createdCurrency.body.currency.id

      const res = await CurrencyFactory.remove([createdCurrencyId])

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
    })
  })

  describe('Duplicate Currency', () => {
    it('should duplicate a currency', async () => {
      const createdCurrency = await CurrencyFactory.create()
      const createdCurrencyId = createdCurrency.body.currency.id

      const res = await CurrencyFactory.duplicate([createdCurrencyId])

      expect(res.status).toBe(200)
    })
  })

  describe('Import Currencies', () => {
    it('should import currencies from file', async () => {
      const res = await CurrencyFactory.upload()

      expect(res.status).toBe(200)
      expect(res.body.currencyIds).toBeDefined()
      expect(Array.isArray(res.body.currencyIds)).toBe(true)
    })
  })

  describe('Batch Update Imported Currencies', () => {
    it('should batch update imported currencies', async () => {
      const resImport = await CurrencyFactory.upload()
      const createdImportedCurrencyIds = resImport.body.currencyIds

      const resBatch = await CurrencyFactory.batch({
        ids: createdImportedCurrencyIds,
        params: [
          { column: 'names', value: { en: 'Dollar Edited', ru: 'Доллар Изменен' } },
        ],
      })

      expect(resBatch.status).toBe(200)
      expect(resBatch.body.status).toBe('success')
    })
  })

  describe('Currency Flow | Create -> Edit -> Remove', () => {
    it('should test currency flow', async () => {
      const resCreate = await CurrencyFactory.create()
      const createdCurrencyId = resCreate.body.currency.id

      const resEdit = await CurrencyFactory.edit({
        id: createdCurrencyId,
        names: {
          en: 'Dollar Edited',
          ru: 'Доллар Изменен',
        },
        symbols: {
          en: 'USDE',
          ru: 'USDE',
        },
        priority: 333,
      })

      const resRemove = await CurrencyFactory.remove([createdCurrencyId])

      expect(resCreate.status).toBe(201)
      expect(resEdit.status).toBe(200)
      expect(resRemove.status).toBe(200)
    })
  })

  describe('Currency Flow | Import -> Batch -> Remove', () => {
    it('should test currency flow', async () => {
      const resImport = await CurrencyFactory.upload()
      const createdImportedCurrencyIds = resImport.body.currencyIds

      const resBatch = await CurrencyFactory.batch({
        ids: createdImportedCurrencyIds,
        params: [{ column: 'names', value: { en: 'Dollar Edited', ru: 'Доллар Изменен' } }],
      })

      const resRemove = await CurrencyFactory.remove(createdImportedCurrencyIds)

      expect(resImport.status).toBe(200)
      expect(resBatch.status).toBe(200)
      expect(resRemove.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('without name', async () => {
      await expectValidationError('/api/currencies/create', { names: { en: 'Dollar', ru: 'Доллар' }, priority: 1, main: false, active: true })
    })
    it('without symbols', async () => {
      await expectValidationError('/api/currencies/create', { symbols: { en: '$', ru: '$' }, priority: 1, main: false, active: true })
    })
  })
})
