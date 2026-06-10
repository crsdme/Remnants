import type {
  CreateDeliveryServiceRequest,
  EditDeliveryServiceRequest,
  GetDeliveryServicesRequest,
  RemoveDeliveryServicesRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { DeliveryServiceModel } from '../../src/models/delivery-service.model'

export async function create(params: CreateDeliveryServiceRequest): Promise<unknown> {
  const response = await request(app).post('/api/delivery-services/create').send(params)

  return response.body
}

export async function get(params?: GetDeliveryServicesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/delivery-services/get').query(params)

  return response.body
}

export async function edit(params: EditDeliveryServiceRequest): Promise<unknown> {
  const response = await request(app).post('/api/delivery-services/edit').send(params)

  return response.body
}

export async function remove(params: RemoveDeliveryServicesRequest): Promise<unknown> {
  const response = await request(app).post('/api/delivery-services/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await DeliveryServiceModel.deleteMany({})

  return response
}
