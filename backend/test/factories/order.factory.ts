import type { CreateOrderRequest, EditOrderRequest, GetOrdersRequest, PayOrderRequest, RemoveOrdersRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { OrderItemModel, OrderModel } from '../../src/models/order.model'

export async function create(params: CreateOrderRequest): Promise<unknown> {
  const response = await request(app).post('/api/orders/create').send(params)

  return response.body
}

export async function get(params?: GetOrdersRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/orders/get').query(params)

  return response.body
}

export async function edit(params: EditOrderRequest): Promise<unknown> {
  const response = await request(app).post('/api/orders/edit').send(params)

  return response.body
}

export async function remove(params: RemoveOrdersRequest): Promise<unknown> {
  const response = await request(app).post('/api/orders/remove').send(params)

  return response.body
}

export async function pay(params: PayOrderRequest): Promise<unknown> {
  const response = await request(app).post('/api/orders/pay').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  await OrderItemModel.deleteMany({})
  return OrderModel.deleteMany({})
}
