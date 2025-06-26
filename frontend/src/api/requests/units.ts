import type {
  batchUnitParams,
  createUnitsParams,
  duplicateUnitParams,
  editUnitParams,
  getUnitsParams,
  importUnitsParams,
  removeUnitParams,
  UnitsResponse,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getUnits(params: getUnitsParams) {
  return api.get<UnitsResponse>('units/get', { params })
}

export async function createUnit(params: createUnitsParams) {
  return api.post<UnitsResponse>('units/create', { ...params })
}

export async function editUnit(params: editUnitParams) {
  return api.post<UnitsResponse>('units/edit', params)
}

export async function removeUnit(params: removeUnitParams) {
  return api.post<UnitsResponse>('units/remove', params)
}

export async function batchUnit(params: batchUnitParams) {
  return api.post<UnitsResponse>('units/batch', params)
}

export async function importUnits(params: importUnitsParams) {
  return api.post<UnitsResponse>('units/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function duplicateUnit(params: duplicateUnitParams) {
  return api.post<UnitsResponse>('units/duplicate', params)
}
