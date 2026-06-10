import type {
  CreateBalanceRequest,
  GetBalanceRequest,
  RemoveBalanceRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { BalanceModel } from '../../src/models/balance.model'

export async function create(params: CreateBalanceRequest): Promise<unknown> {
  const response = await request(app).post('/api/balances/create').send(params)

  return response.body
}

export async function get(params?: GetBalanceRequest): Promise<unknown> {
  if (!params) {
    params = {
      filters: {
        date: {
          from: new Date(new Date().setHours(0, 0, 0, 0)),
          to: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }
  }

  const response = await request(app).get('/api/balances/get').query(params)

  return response.body
}

export async function remove(params: RemoveBalanceRequest): Promise<unknown> {
  const response = await request(app).post('/api/balances/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const res = await BalanceModel.deleteMany({})

  return res
}
