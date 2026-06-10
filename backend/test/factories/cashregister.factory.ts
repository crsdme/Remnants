import type {
  CreateCashregisterRequest,
  EditCashregisterRequest,
  GetCashregistersRequest,
  RemoveCashregistersRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { CashregisterModel } from '../../src/models/cashregister.model'

export async function create(params: CreateCashregisterRequest): Promise<unknown> {
  const response = await request(app).post('/api/cashregisters/create').send(params)

  return response.body
}

export async function get(params?: GetCashregistersRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/cashregisters/get').query(params)

  return response.body
}

export async function edit(params: EditCashregisterRequest): Promise<unknown> {
  const response = await request(app).post('/api/cashregisters/edit').send(params)

  return response.body
}

export async function remove(params: RemoveCashregistersRequest): Promise<unknown> {
  const response = await request(app).post('/api/cashregisters/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await CashregisterModel.deleteMany({})

  return response
}
