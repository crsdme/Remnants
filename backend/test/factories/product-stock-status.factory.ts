import type {
  CreateProductStockStatusRequest,
  EditProductStockStatusRequest,
  GetProductStockStatusesRequest,
  RemoveProductStockStatusesRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { ProductStockStatusModel } from '../../src/models/product-stock-status.model'

export async function create(params: CreateProductStockStatusRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-stock-statuses/create').send(params)

  return response.body
}

export async function get(params?: GetProductStockStatusesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/product-stock-statuses/get').query(params)

  return response.body
}

export async function edit(params: EditProductStockStatusRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-stock-statuses/edit').send(params)

  return response.body
}

export async function remove(params: RemoveProductStockStatusesRequest): Promise<unknown> {
  const response = await request(app).post('/api/product-stock-statuses/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await ProductStockStatusModel.deleteMany({})

  return response
}
