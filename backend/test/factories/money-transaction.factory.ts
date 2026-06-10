import type { CreateMoneyTransactionRequest, GetMoneyTransactionsRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { MoneyTransactionModel } from '../../src/models/money-transaction.model'

export async function create(params: CreateMoneyTransactionRequest): Promise<unknown> {
  const response = await request(app).post('/api/money-transactions/create').send(params)

  return response.body
}

export async function get(params?: GetMoneyTransactionsRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/money-transactions/get').query(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await MoneyTransactionModel.deleteMany({})

  return response
}
