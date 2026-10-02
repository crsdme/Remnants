import type { GetPaymentApplicationsRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { PaymentApplicationModel } from '@/models'

export async function get(params?: GetPaymentApplicationsRequest): Promise<unknown> {
  const response = await request(app).get('/api/payment-applications/get').query(params ?? {
    pagination: { current: 1, pageSize: 10 },
  })
  return response.body
}

export async function removeAll() {
  return PaymentApplicationModel.deleteMany({})
}
