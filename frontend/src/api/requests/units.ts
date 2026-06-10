import type {
  CreateUnitRequest,
  CreateUnitResponse,
  EditUnitRequest,
  EditUnitResponse,
  GetUnitRequest,
  GetUnitsResponse,
  RemoveUnitRequest,
  RemoveUnitsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getUnits(params: GetUnitRequest) {
  return api.get<GetUnitsResponse>('units/get', { params })
}

export async function createUnit(params: CreateUnitRequest) {
  return api.post<CreateUnitResponse>('units/create', { ...params })
}

export async function editUnit(params: EditUnitRequest) {
  return api.post<EditUnitResponse>('units/edit', params)
}

export async function removeUnit(params: RemoveUnitRequest) {
  return api.post<RemoveUnitsResponse>('units/remove', params)
}
