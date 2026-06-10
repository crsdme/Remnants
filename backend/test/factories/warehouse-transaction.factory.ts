import type { CreateWarehouseTransactionRequest, EditWarehouseTransactionRequest, GetWarehouseTransactionsRequest, RemoveWarehouseTransactionsRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { WarehouseTransactionModel } from '@/models/warehouse-transaction.model'

export async function create(params: CreateWarehouseTransactionRequest): Promise<unknown> {
  const response = await request(app).post('/api/warehouse-transactions/create').send(params)

  return response.body
}

export async function get(params?: GetWarehouseTransactionsRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/warehouse-transactions/get').query(params)

  return response.body
}

export async function edit(params: EditWarehouseTransactionRequest): Promise<unknown> {
  const response = await request(app).post('/api/warehouse-transactions/edit').send(params)

  return response.body
}

export async function remove(params: RemoveWarehouseTransactionsRequest): Promise<unknown> {
  const response = await request(app).post('/api/warehouse-transactions/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await WarehouseTransactionModel.deleteMany({})

  return response
}
