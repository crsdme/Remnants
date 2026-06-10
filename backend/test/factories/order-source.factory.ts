import type { CreateOrderSourceRequest, EditOrderSourceRequest, GetOrderSourcesRequest, RemoveOrderSourcesRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { OrderSourceModel } from '../../src/models/order-source.model'

export async function create(params: CreateOrderSourceRequest): Promise<unknown> {
  const response = await request(app).post('/api/order-sources/create').send(params)

  return response.body
}

export async function get(params?: GetOrderSourcesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/order-sources/get').query(params)

  return response.body
}

export async function edit(params: EditOrderSourceRequest): Promise<unknown> {
  const response = await request(app).post('/api/order-sources/edit').send(params)

  return response.body
}

export async function remove(params: RemoveOrderSourcesRequest): Promise<unknown> {
  const response = await request(app).post('/api/order-sources/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await OrderSourceModel.deleteMany({})

  return response
}
