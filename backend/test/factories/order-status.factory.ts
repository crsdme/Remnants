import type { CreateOrderStatusRequest, EditOrderStatusRequest, GetOrderStatusesRequest, RemoveOrderStatusesRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { OrderStatusModel } from '../../src/models/order-status.model'

export async function create(params: CreateOrderStatusRequest): Promise<unknown> {
  const response = await request(app).post('/api/order-statuses/create').send(params)

  return response.body
}

export async function get(params?: GetOrderStatusesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/order-statuses/get').query(params)

  return response.body
}

export async function edit(params: EditOrderStatusRequest): Promise<unknown> {
  const response = await request(app).post('/api/order-statuses/edit').send(params)

  return response.body
}

export async function remove(params: RemoveOrderStatusesRequest): Promise<unknown> {
  const response = await request(app).post('/api/order-statuses/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await OrderStatusModel.deleteMany({})

  return response
}
