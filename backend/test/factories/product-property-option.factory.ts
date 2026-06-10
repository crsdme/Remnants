import type { CreateProductPropertyOptionRequest, EditProductPropertyOptionRequest, GetProductPropertyOptionRequest, RemoveProductPropertyOptionRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { ProductPropertyOptionModel } from '../../src/models/product-property-option.model'

export async function create(params: CreateProductPropertyOptionRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-properties-options/create').send(params)

  return response.body
}

export async function get(params?: GetProductPropertyOptionRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/product-properties-options/get').query(params)

  return response.body
}

export async function edit(params: EditProductPropertyOptionRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-properties-options/edit').send(params)

  return response.body
}

export async function remove(params: RemoveProductPropertyOptionRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-properties-options/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await ProductPropertyOptionModel.deleteMany({})

  return response
}
