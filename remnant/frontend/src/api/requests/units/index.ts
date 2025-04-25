import { api } from '@/api/instance'

export interface getUnitsParams {
  // filters: {
  //   current: number;
  //   pageSize: number;
  // };
  // sorters: {
  //   current: number;
  //   pageSize: number;
  // };
  pagination: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export async function getUnits(params: getUnitsParams) {
  return api.get<UnitsResponse>('units/get', { params })
}

export type createUnitsParams = Unit

export async function createUnit(params: createUnitsParams) {
  return api.post<UnitsResponse>('units/create', { ...params })
}

export type editUnitParams = Unit

export async function editUnit(params: editUnitParams) {
  return api.post<UnitsResponse>('units/edit', params)
}

export interface removeUnitParams {
  _id: string
}

export async function removeUnit(params: removeUnitParams) {
  return api.post<UnitsResponse>('units/remove', params)
}
