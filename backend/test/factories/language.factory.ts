import type { CreateLanguageRequest, EditLanguageRequest, GetLanguagesRequest, RemoveLanguageRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { LanguageModel } from '../../src/models/language.model'

export async function create(params: CreateLanguageRequest): Promise<unknown> {
  const response = await request(app).post('/api/languages/create').send(params)

  return response.body
}

export async function get(params?: GetLanguagesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/languages/get').query(params)

  return response.body
}

export async function edit(params: EditLanguageRequest): Promise<unknown> {
  const response = await request(app).post('/api/languages/edit').send(params)

  return response.body
}

export async function remove(params: RemoveLanguageRequest): Promise<unknown> {
  const response = await request(app).post('/api/languages/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await LanguageModel.deleteMany({})

  return response
}
