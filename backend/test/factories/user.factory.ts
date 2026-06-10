import type { CreateUserRequest, EditUserRequest, GetUserRequest, RemoveUserRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { UserModel } from '@/models/user.model'

export async function create(params: CreateUserRequest): Promise<unknown> {
  const response = await request(app).post('/api/users/create').send(params)

  return response.body
}

export async function get(params?: GetUserRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/users/get').query(params)

  return response.body
}

export async function edit(params: EditUserRequest): Promise<unknown> {
  const response = await request(app).post('/api/users/edit').send(params)

  return response.body
}

export async function remove(params: RemoveUserRequest): Promise<unknown> {
  const response = await request(app).post('/api/users/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await UserModel.deleteMany({})

  return response
}
