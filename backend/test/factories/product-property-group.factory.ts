import type { CreateProductPropertyGroupRequest, EditProductPropertyGroupRequest, GetProductPropertyGroupRequest, RemoveProductPropertyGroupRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { ProductPropertyGroupModel } from '../../src/models/product-property-group.model'

export async function create(params: CreateProductPropertyGroupRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-properties-groups/create').send(params)

  return response.body
}

export async function get(params?: GetProductPropertyGroupRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/product-properties-groups/get').query(params)

  return response.body
}

export async function edit(params: EditProductPropertyGroupRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-properties-groups/edit').send(params)

  return response.body
}

export async function remove(params: RemoveProductPropertyGroupRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-properties-groups/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await ProductPropertyGroupModel.deleteMany({})

  return response
}
