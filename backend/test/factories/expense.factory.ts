import type {
  CreateExpenseRequest,
  EditExpenseRequest,
  GetExpensesRequest,
  RemoveExpensesRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { ExpenseModel } from '../../src/models/expense.model'

export async function create(params: CreateExpenseRequest): Promise<unknown> {
  const response = await request(app).post('/api/expenses/create').send(params)

  return response.body
}

export async function get(params?: GetExpensesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/expenses/get').query(params)

  return response.body
}

export async function edit(params: EditExpenseRequest): Promise<unknown> {
  const response = await request(app).post('/api/expenses/edit').send(params)

  return response.body
}

export async function remove(params: RemoveExpensesRequest): Promise<unknown> {
  const response = await request(app).post('/api/expense/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await ExpenseModel.deleteMany({})

  return response
}
