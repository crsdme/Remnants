import type { CreateQuantitiesRequest, EditQuantitiesRequest, GetQuantitiesRequest, RemoveQuantitiesRequest } from '@remnant/shared'
import { QuantityModel } from '../../src/models/quantity.model'
import * as QuantityService from '../../src/services/quantity.service'

export async function create(params: CreateQuantitiesRequest): Promise<unknown> {
  const response = await QuantityService.create({ payload: params })

  return response
}

export async function get(params?: GetQuantitiesRequest): Promise<unknown> {
  if (!params) {
    params = {}
  }

  const response = await QuantityService.get({ payload: params })

  return response
}

export async function edit(params: EditQuantitiesRequest): Promise<unknown> {
  const response = await QuantityService.edit({ payload: params })

  return response
}

export async function remove(params: RemoveQuantitiesRequest): Promise<unknown> {
  const response = await QuantityService.remove({ payload: params })

  return response
}

export async function removeAll(): Promise<unknown> {
  const response = await QuantityModel.deleteMany({})

  return response
}
