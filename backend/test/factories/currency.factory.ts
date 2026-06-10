import type {
  CreateCurrencyRequest,
  EditCurrencyRequest,
  GetCurrencyRequest,
  RemoveCurrencyRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { CurrencyModel } from '../../src/models/currency.model'

export async function create(params: CreateCurrencyRequest): Promise<unknown> {
  const response = await request(app).post('/api/currencies/create').send(params)

  return response.body
}

export async function get(params?: GetCurrencyRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/currencies/get').query(params)

  return response.body
}

export async function edit(params: EditCurrencyRequest): Promise<unknown> {
  const response = await request(app).post('/api/currencies/edit').send(params)

  return response.body
}

export async function remove(params: RemoveCurrencyRequest): Promise<unknown> {
  const response = await request(app).post('/api/currencies/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await CurrencyModel.deleteMany({})

  return response
}
