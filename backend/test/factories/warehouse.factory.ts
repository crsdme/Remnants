import type { CreateWarehouseRequest, EditWarehouseRequest, GetWarehousesRequest, RemoveWarehousesRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { WarehouseModel } from '@/models/warehouse.model'

export async function create(params: CreateWarehouseRequest): Promise<unknown> {
  const response = await request(app).post('/api/warehouses/create').send(params)

  return response.body
}

export async function get(params?: GetWarehousesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/warehouses/get').query(params)

  return response.body
}

export async function edit(params: EditWarehouseRequest): Promise<unknown> {
  const response = await request(app).post('/api/warehouses/edit').send(params)

  return response.body
}

export async function remove(params: RemoveWarehousesRequest): Promise<unknown> {
  const response = await request(app).post('/api/warehouses/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await WarehouseModel.deleteMany({})

  return response
}
