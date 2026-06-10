import type {
  CreateAuditLogsRequest,
  EditAuditLogsRequest,
  GetAuditLogsRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import * as AuditLogService from '@/services/audit-logs.service'
import { AuditLogsModel } from '../../src/models/audit-logs.model'

export async function create(params: CreateAuditLogsRequest): Promise<unknown> {
  const response = await AuditLogService.create(params)

  return response
}

export async function get(params?: GetAuditLogsRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/audit-logs/get').query(params)

  return response.body
}

export async function edit(params: EditAuditLogsRequest): Promise<unknown> {
  const response = await request(app).post('/api/audit-logs/edit').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await AuditLogsModel.deleteMany({})

  return response
}
