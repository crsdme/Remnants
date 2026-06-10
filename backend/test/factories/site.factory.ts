import type { CreateSiteRequest, EditSiteRequest, GetSitesRequest, RemoveSitesRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { SiteModel } from '../../src/models/site.model'

export async function create(params: CreateSiteRequest): Promise<unknown> {
  const response = await request(app).post('/api/sites/create').send(params)

  return response.body
}

export async function get(params?: GetSitesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/sites/get').query(params)

  return response.body
}

export async function edit(params: EditSiteRequest): Promise<unknown> {
  const response = await request(app).post('/api/sites/edit').send(params)

  return response.body
}

export async function remove(params: RemoveSitesRequest): Promise<unknown> {
  const response = await request(app).post('/api/sites/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await SiteModel.deleteMany({})

  return response
}
