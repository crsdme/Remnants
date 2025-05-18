import request from 'supertest'
import { expect } from 'vitest'
import app from '../../src/'

export async function expectValidationError(path: string, payload: any) {
  const res = await request(app).post(path).send(payload)
  expect(res.status).toBe(400)
  expect(res.body).toHaveProperty('error')
}
