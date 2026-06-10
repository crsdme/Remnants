import type { CreateProductRequest, EditProductRequest, GetProductRequest, RemoveProductRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { ProductModel } from '../../src/models/product.model'

export async function create(params: CreateProductRequest): Promise<unknown> {
  const response = await request(app).post('/api/products/create').send(params)

  return response.body
}

export async function get(params?: GetProductRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/products/get').query(params)

  return response.body
}

export async function edit(params: EditProductRequest): Promise<unknown> {
  const response = await request(app).post('/api/products/edit').send(params)

  return response.body
}

export async function remove(params: RemoveProductRequest): Promise<unknown> {
  const response = await request(app).post('/api/products/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await ProductModel.deleteMany({})

  return response
}
