import type { CreateProductPropertyRequest, EditProductPropertyRequest, GetProductPropertyRequest, RemoveProductPropertyRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { ProductPropertyModel } from '../../src/models/product-property.model'

export async function create(params: CreateProductPropertyRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-properties/create').send(params)

  return response.body
}

export async function get(params?: GetProductPropertyRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/product-properties/get').query(params)

  return response.body
}

export async function edit(params: EditProductPropertyRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-properties/edit').send(params)

  return response.body
}

export async function remove(params: RemoveProductPropertyRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-properties/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await ProductPropertyModel.deleteMany({})

  return response
}
