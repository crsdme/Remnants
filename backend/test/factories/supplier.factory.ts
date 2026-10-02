import type { GetSuppliersRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'

export async function get(params?: GetSuppliersRequest): Promise<unknown> {
  const response = await request(app).get('/api/suppliers/get').query(params ?? {
    pagination: { current: 1, pageSize: 10 },
  })
  return response.body
}
