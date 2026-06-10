import type {
  CreateCategoryRequest,
  EditCategoryRequest,
  GetCategoriesRequest,
  RemoveCategoriesRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { CategoryModel } from '../../src/models/category.model'

export async function create(params: CreateCategoryRequest): Promise<unknown> {
  const response = await request(app).post('/api/categories/create').send(params)

  return response.body
}

export async function get(params?: GetCategoriesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/categories/get').query(params)

  return response.body
}

export async function edit(params: EditCategoryRequest): Promise<unknown> {
  const response = await request(app).post('/api/categories/edit').send(params)

  return response.body
}

export async function remove(params: RemoveCategoriesRequest): Promise<unknown> {
  const response = await request(app).post('/api/categories/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await CategoryModel.deleteMany({})

  return response
}
