import path from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../../src/'

describe('currency API', () => {
  let createdCurrencyId: string
  // let createdImportedCurrencyIds: string[] = []

  beforeAll(async () => {
    const res = await request(app).post('/api/currencies/create').send({
      names: { ru: 'Доллар', en: 'Dollar' },
      symbols: { ru: '$', en: '$' },
      priority: 1,
      active: true,
    })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('status')
    expect(res.body.status).toBe('success')

    createdCurrencyId = res.body.currency._id
  })

  afterAll(async () => {
    await request(app).post('/api/currencies/remove').send({
      _ids: [createdCurrencyId],
    })
  })

  describe('Create Currency', () => {
    it('should create a currency', async () => {
      expect(true).toBe(true)
    })
  })

  // describe('Get Currencies', () => {
  //   it('should return list of currencies', async () => {
  //     const res = await request(app).get('/api/currencies/get').query({
  //       'pagination[current]': 1,
  //       'pagination[pageSize]': 10,
  //       'filters[names]': '',
  //       'filters[symbols]': '',
  //       'filters[language]': 'en',
  //     })

  //     expect(res.status).toBe(200)
  //     expect(res.body).toHaveProperty('currencies')
  //     expect(res.body).toHaveProperty('currenciesCount')
  //     expect(Array.isArray(res.body.currencies)).toBe(true)
  //   })
  // })

  // describe('Duplicate Currency', () => {
  //   it('should duplicate a currency', async () => {
  //     const res = await request(app).post('/api/currencies/duplicate').send({
  //       _ids: [createdCurrencyId],
  //     })

  //     expect(res.status).toBe(200)
  //     expect(res.body).toHaveProperty('status')
  //     expect(res.body.status).toBe('success')
  //   })
  // })

  // describe('Edit Currency', () => {
  //   let createdCurrencyIdEdit = ''
  //   it('should create a currency', async () => {
  //     const res = await request(app).post('/api/currencies/create').send({
  //       names: { ru: 'Доллар', en: 'Dollar' },
  //       symbols: { ru: '$', en: '$' },
  //       priority: 1,
  //       active: true,
  //     })

  //     expect(res.status).toBe(201)
  //     expect(res.body).toHaveProperty('status')
  //     expect(res.body.status).toBe('success')

  //     createdCurrencyIdEdit = res.body.currency._id
  //   })
  //   it('should edit a currency', async () => {
  //     const res = await request(app).post('/api/currencies/edit').send({
  //       _id: createdCurrencyIdEdit,
  //       names: { ru: 'Доллар Edited', en: 'Dollar Edited' },
  //       symbols: { ru: '$ Edited', en: '$ Edited' },
  //       priority: 2,
  //       active: false,
  //     })

  //     expect(res.status).toBe(200)
  //     expect(res.body).toHaveProperty('status')
  //     expect(res.body.status).toBe('success')
  //   })
  // })

  // describe('Import Currencies', () => {
  //   it('should import currencies from file', async () => {
  //     const filePath = path.join(__dirname, '../files/test-import-currencies.csv')

  //     const res = await request(app).post('/api/currencies/import').attach('file', filePath)

  //     expect(res.status).toBe(200)
  //     expect(res.body).toHaveProperty('status')
  //     expect(res.body.status).toBe('success')
  //   })
  // })

  // describe('Get Imported Currencies', () => {
  //   it('should return list of imported currencies', async () => {
  //     const res = await request(app).get('/api/currencies/get').query({
  //       'pagination[current]': 1,
  //       'pagination[pageSize]': 10,
  //       'filters[names]': '',
  //       'filters[symbols]': '',
  //       'filters[language]': 'en',
  //     })

  //     expect(res.status).toBe(200)
  //     expect(res.body).toHaveProperty('currencies')
  //     expect(res.body).toHaveProperty('currenciesCount')
  //     expect(Array.isArray(res.body.currencies)).toBe(true)

  //     createdImportedCurrencyIds = res.body.currencies
  //       .filter((currency: any) => currency._id !== createdCurrencyId) // Отфильтруем базовую валюту
  //       .map((currency: any) => currency._id)
  //   })
  // })

  // describe('Batch Update Imported Currencies', () => {
  //   it('should batch update imported currencies', async () => {
  //     const res = await request(app).post('/api/currencies/batch').send({
  //       _ids: createdImportedCurrencyIds,
  //       params: [
  //         { column: 'names', value: { ru: 'Доллар Batch', en: 'Dollar Batch' } },
  //         { column: 'symbols', value: { ru: '$ Batch', en: '$ Batch' } },
  //         { column: 'priority', value: 1 },
  //         { column: 'active', value: true },
  //       ],
  //     })

  //     expect(res.status).toBe(200)
  //     expect(res.body.status).toBe('success')
  //   })
  // })

  // describe('Get Batched Currencies', () => {
  //   it('should return list of batched currencies', async () => {
  //     const res = await request(app).get('/api/currencies/get').query({
  //       'pagination[current]': 1,
  //       'pagination[pageSize]': 10,
  //       'filters[names]': '',
  //       'filters[symbols]': '',
  //       'filters[language]': 'en',
  //     })

  //     expect(res.status).toBe(200)
  //     expect(res.body).toHaveProperty('currencies')
  //     expect(res.body).toHaveProperty('currenciesCount')
  //     expect(Array.isArray(res.body.currencies)).toBe(true)
  //   })
  // })

  // describe('Currency API Error Handling', () => {
  //   describe('Create Currency Errors', () => {
  //     it('should fail if names are missing', async () => {
  //       const res = await request(app).post('/api/currencies/create').send({
  //         symbols: { ru: '$', en: '$' },
  //         priority: 1,
  //         active: true,
  //       })

  //       expect(res.status).toBe(400)
  //       expect(res.body).toHaveProperty('error')
  //     })

  //     it('should fail if symbols are missing', async () => {
  //       const res = await request(app).post('/api/currencies/create').send({
  //         names: { ru: 'Евро', en: 'Euro' },
  //         priority: 1,
  //         active: true,
  //       })

  //       expect(res.status).toBe(400)
  //       expect(res.body).toHaveProperty('error')
  //     })
  //   })

  //   describe('Import Currency Errors', () => {
  //     it('should fail if no file is uploaded', async () => {
  //       const res = await request(app).post('/api/currencies/import')
  //       expect(res.status).toBe(400)
  //       expect(res.body).toHaveProperty('error')
  //     })
  //   })

  //   describe('Batch Currency Errors', () => {
  //     it('should fail if _ids array is missing', async () => {
  //       const res = await request(app).post('/api/currencies/batch').send({
  //         params: [
  //           { column: 'priority', value: 1 },
  //         ],
  //       })

  //       expect(res.status).toBe(400)
  //       expect(res.body).toHaveProperty('error')
  //     })

  //     it('should fail if params array is missing', async () => {
  //       const res = await request(app).post('/api/currencies/batch').send({
  //         _ids: ['some-random-id'],
  //       })

  //       expect(res.status).toBe(400)
  //       expect(res.body).toHaveProperty('error')
  //     })
  //   })

  //   describe('Edit Currency Errors', () => {
  //     it('should fail if _id is missing', async () => {
  //       const res = await request(app).post('/api/currencies/edit').send({
  //         names: { ru: 'Тест', en: 'Test' },
  //       })

  //       expect(res.status).toBe(400)
  //       expect(res.body).toHaveProperty('error')
  //     })

  //     it('should fail if trying to edit non-existing currency', async () => {
  //       const res = await request(app).post('/api/currencies/edit').send({
  //         _id: '6623b0b8f8b6909b5a1e5abc',
  //         names: { ru: 'Тест', en: 'Test' },
  //       })

  //       expect(res.status === 404 || res.status === 400).toBeTruthy()
  //       expect(res.body).toHaveProperty('error')
  //     })
  //   })
  // })
})
