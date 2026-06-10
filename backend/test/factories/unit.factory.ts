import type {
  CreateUnitRequest,
  EditUnitRequest,
  GetUnitRequest,
  RemoveUnitRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { UnitModel } from '@/models/unit.model'

export async function create(params: CreateUnitRequest): Promise<unknown> {
  const response = await request(app).post('/api/units/create').send(params)

  return response.body
}

export async function get(params?: GetUnitRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/units/get').query(params)

  return response.body
}

export async function edit(params: EditUnitRequest): Promise<unknown> {
  const response = await request(app).post('/api/units/edit').send(params)

  return response.body
}

export async function remove(params: RemoveUnitRequest): Promise<unknown> {
  const response = await request(app).post('/api/units/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await UnitModel.deleteMany({})

  return response
}
