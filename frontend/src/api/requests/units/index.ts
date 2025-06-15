import { api } from '@/api/instance'

export interface getUnitsParams {
  filters: {
    names?: string
    symbols?: string
    language: string
    active?: boolean[]
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
    updatedAt?: {
      from?: Date
      to?: Date
    }
  }
  sorters?: {
    names?: number
    priority?: number
    createdAt?: number
    updatedAt?: number
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export async function getUnits(params: getUnitsParams) {
  return api.get<UnitsResponse>('units/get', { params })
}

export interface createUnitsParams {
  names: LanguageString
  symbols: LanguageString
  priority: number
  active?: boolean
}

export async function createUnit(params: createUnitsParams) {
  return api.post<UnitsResponse>('units/create', { ...params })
}

export interface editUnitParams {
  id: string
  names: LanguageString
  symbols: LanguageString
  priority: number
  active?: boolean
}

export async function editUnit(params: editUnitParams) {
  return api.post<UnitsResponse>('units/edit', params)
}

export interface removeUnitParams {
  ids: string[]
}

export async function removeUnit(params: removeUnitParams) {
  return api.post<UnitsResponse>('units/remove', params)
}

interface batchItem {
  id: string
  column: string
  value: string | number | boolean | Record<string, string>
}

interface batchFilterItem {
  filters?: {
    names?: string
    symbols?: string
    language: string
    active?: boolean[]
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
  }
}

export interface batchUnitParams {
  ids: string[]
  params: batchItem[]
  filters: batchFilterItem[]
}

export async function batchUnit(params: batchUnitParams) {
  return api.post<UnitsResponse>('units/batch', params)
}

export interface importUnitsParams {
  file: File
}

export async function importUnits(params: importUnitsParams) {
  return api.post<UnitsResponse>('units/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export interface duplicateUnitParams {
  ids: string[]
}

export async function duplicateUnit(params: duplicateUnitParams) {
  return api.post<UnitsResponse>('units/duplicate', params)
}
