import type {
  CreateAutomationRequest,
  EditAutomationRequest,
  GetAutomationsRequest,
  RemoveAutomationsRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { AutomationModel } from '../../src/models/automation.model'

export async function create(params: CreateAutomationRequest): Promise<unknown> {
  const response = await request(app).post('/api/automations/create').send(params)

  return response.body
}

export async function get(params?: GetAutomationsRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {},
    }
  }

  const response = await request(app).get('/api/automations/get').query(params)

  return response.body
}

export async function edit(params: EditAutomationRequest): Promise<unknown> {
  const response = await request(app).post('/api/automations/edit').send(params)

  return response.body
}

export async function remove(params: RemoveAutomationsRequest): Promise<unknown> {
  const response = await request(app).post('/api/automations/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await AutomationModel.deleteMany({})

  return response
}
