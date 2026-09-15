import type {
  CancelMoneyTransactionRequest,
  CreateMoneyTransactionRequest,
  CreateMoneyTransactionTransferRequest,
  GetMoneyTransactionsRequest,
  ReceiveMoneyTransactionRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { MoneyTransactionModel } from '../../src/models/money-transaction.model'

export async function create(params: CreateMoneyTransactionRequest): Promise<unknown> {
  const response = await request(app).post('/api/money-transactions/create-transaction').send(params)

  return response.body
}

export async function createTransfer(params: CreateMoneyTransactionTransferRequest): Promise<unknown> {
  const response = await request(app).post('/api/money-transactions/create-transfer').send(params)

  return response.body
}

export async function receive(params: ReceiveMoneyTransactionRequest): Promise<unknown> {
  const response = await request(app).post('/api/money-transactions/receive').send(params)

  return response.body
}

export async function cancel(params: CancelMoneyTransactionRequest): Promise<unknown> {
  const response = await request(app).post('/api/money-transactions/cancel').send(params)

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
