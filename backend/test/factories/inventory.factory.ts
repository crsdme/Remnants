import type {
  CreateInventoryRequest,
  EditInventoryRequest,
  GetInventoriesRequest,
  RemoveInventoriesRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { InventoryModel } from '../../src/models/inventories.model'

export async function create(params: CreateInventoryRequest): Promise<unknown> {
  const response = await request(app).post('/api/inventories/create').send(params)

  return response.body
}

export async function get(params?: GetInventoriesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/inventories/get').query(params)

  return response.body
}

export async function edit(params: EditInventoryRequest): Promise<unknown> {
  const response = await request(app).post('/api/inventories/edit').send(params)

  return response.body
}

export async function remove(params: RemoveInventoriesRequest): Promise<unknown> {
  const response = await request(app).post('/api/inventories/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await InventoryModel.deleteMany({})

  return response
}
