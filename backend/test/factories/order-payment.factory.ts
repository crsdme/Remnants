import type { CreateOrderPaymentRequest, EditOrderPaymentRequest, GetOrderPaymentsRequest, RemoveOrderPaymentsRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { OrderPaymentModel } from '../../src/models/order-payment.model'

export async function create(params: CreateOrderPaymentRequest): Promise<unknown> {
  const response = await request(app).post('/api/order-payments/create').send(params)

  return response.body
}

export async function get(params?: GetOrderPaymentsRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/order-payments/get').query(params)

  return response.body
}

export async function edit(params: EditOrderPaymentRequest): Promise<unknown> {
  const response = await request(app).post('/api/order-payments/edit').send(params)

  return response.body
}

export async function remove(params: RemoveOrderPaymentsRequest): Promise<unknown> {
  const response = await request(app).post('/api/order-payments/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await OrderPaymentModel.deleteMany({})

  return response
}
