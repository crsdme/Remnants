import type {
  CreateCashregisterAccountRequest,
  EditCashregisterAccountRequest,
  GetCashregisterAccountsRequest,
  RemoveCashregisterAccountsRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { CashregisterAccountModel } from '../../src/models/cashregister-account.model'

export async function create(params: CreateCashregisterAccountRequest): Promise<unknown> {
  const response = await request(app).post('/api/cashregister-accounts/create').send(params)

  return response.body
}

export async function get(params?: GetCashregisterAccountsRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/cashregister-accounts/get').query(params)

  return response.body
}

export async function edit(params: EditCashregisterAccountRequest): Promise<unknown> {
  const response = await request(app).post('/api/cashregister-accounts/edit').send(params)

  return response.body
}

export async function remove(params: RemoveCashregisterAccountsRequest): Promise<unknown> {
  const response = await request(app).post('/api/cashregister-accounts/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await CashregisterAccountModel.deleteMany({})

  return response
}
