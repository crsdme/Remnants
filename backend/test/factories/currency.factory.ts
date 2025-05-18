import path from 'node:path'
import request from 'supertest'
import app from '../../src/'
import { CurrencyModel } from '../../src/models/currency.model'

export async function create(currency?: any) {
  if (!currency) {
    currency = {
      names: {
        en: 'Dollar',
        ru: 'Доллар',
      },
      symbols: {
        en: '$',
        ru: '$',
      },
      priority: 1,
      main: true,
      active: true,
    }
  }

  const res = await request(app).post('/api/currencies/create').send(currency)

  return res
}

export async function get(params?: any) {
  if (!params) {
    params = {
      'pagination[current]': 1,
      'pagination[pageSize]': 10,
    }
  }

  const res = await request(app).get('/api/currencies/get').query(params)

  return res
}

export async function edit(params: any) {
  const res = await request(app).post('/api/currencies/edit').send(params)

  return res
}

export async function duplicate(ids: string[]) {
  const res = await request(app).post('/api/currencies/duplicate').send({ ids })

  return res
}

export async function upload(filePath?: string) {
  if (!filePath) {
    filePath = path.join(__dirname, '../files/test-import-currencies.csv')
  }

  const res = await request(app).post('/api/currencies/import').attach('file', filePath)

  return res
}

export async function batch(params: any) {
  const res = await request(app).post('/api/currencies/batch').send(params)

  return res
}

export async function remove(ids: string[]) {
  const res = await request(app).post('/api/currencies/remove').send({ ids })

  return res
}

export async function removeAll() {
  const res = await CurrencyModel.deleteMany({})

  return res
}
