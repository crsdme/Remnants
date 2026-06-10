import type { CreateUserRoleRequest, EditUserRoleRequest, GetUserRoleRequest, RemoveUserRoleRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { UserRoleModel } from '@/models/user-role.model'

export async function create(params: CreateUserRoleRequest): Promise<unknown> {
  const response = await request(app).post('/api/user-roles/create').send(params)

  return response.body
}

export async function get(params?: GetUserRoleRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/user-roles/get').query(params)

  return response.body
}

export async function edit(params: EditUserRoleRequest): Promise<unknown> {
  const response = await request(app).post('/api/user-roles/edit').send(params)

  return response.body
}

export async function remove(params: RemoveUserRoleRequest): Promise<unknown> {
  const response = await request(app).post('/api/user-roles/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await UserRoleModel.deleteMany({})

  return response
}
