import type {
  CreateClientRequest,
  EditClientRequest,
  GetClientsRequest,
  RemoveClientsRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { ClientModel } from '../../src/models/client.model'

export async function create(params: CreateClientRequest): Promise<unknown> {
  const response = await request(app).post('/api/clients/create').send(params)

  return response.body
}

export async function get(params?: GetClientsRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/clients/get').query(params)

  return response.body
}

export async function edit(params: EditClientRequest): Promise<unknown> {
  const response = await request(app).post('/api/clients/edit').send(params)

  return response.body
}

export async function remove(params: RemoveClientsRequest): Promise<unknown> {
  const response = await request(app).post('/api/clients/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await ClientModel.deleteMany({})

  return response
}
