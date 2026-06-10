import type { CreateSettingRequest, EditSettingRequest, GetSettingsRequest, RemoveSettingRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { SettingModel } from '../../src/models/setting.model'

export async function create(params: CreateSettingRequest): Promise<unknown> {
  const response = await request(app).post('/api/settings/create').send(params)

  return response.body
}

export async function get(params?: GetSettingsRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/settings/get').query(params)

  return response.body
}

export async function edit(params: EditSettingRequest): Promise<unknown> {
  const response = await request(app).post('/api/settings/edit').send(params)

  return response.body
}

export async function remove(params: RemoveSettingRequest): Promise<unknown> {
  const response = await request(app).post('/api/settings/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await SettingModel.deleteMany({})

  return response
}
