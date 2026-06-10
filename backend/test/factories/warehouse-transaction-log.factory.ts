import type { CreateWarehouseTransactionLogsRequest, GetWarehouseTransactionLogsRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { WarehouseTransactionLogModel } from '@/models/warehouse-transaction-log.model'

export async function create(params: CreateWarehouseTransactionLogsRequest): Promise<unknown> {
  const response = await request(app).post('/api/warehouse-transaction-logs/create').send(params)

  return response.body
}

export async function get(params?: GetWarehouseTransactionLogsRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/warehouse-transaction-logs/get').query(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await WarehouseTransactionLogModel.deleteMany({})

  return response
}
