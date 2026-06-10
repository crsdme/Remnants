import type {
  CreateExpenseCategoryRequest,
  EditExpenseCategoryRequest,
  GetExpenseCategoriesRequest,
  RemoveExpenseCategoriesRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { ExpenseCategoryModel } from '../../src/models/expense.model'

export async function create(params: CreateExpenseCategoryRequest): Promise<unknown> {
  const response = await request(app).post('/api/expense-categories/create').send(params)

  return response.body
}

export async function get(params?: GetExpenseCategoriesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/expense-categories/get').query(params)

  return response.body
}

export async function edit(params: EditExpenseCategoryRequest): Promise<unknown> {
  const response = await request(app).post('/api/expense-categories/edit').send(params)

  return response.body
}

export async function remove(params: RemoveExpenseCategoriesRequest): Promise<unknown> {
  const response = await request(app).post('/api/expense-categories/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await ExpenseCategoryModel.deleteMany({})

  return response
}
