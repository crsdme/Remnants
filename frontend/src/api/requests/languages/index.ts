import { api } from '@/api/instance'

export interface getLanguagesParams {
  filters?: {
    name?: string
    code?: string
    active?: boolean[]
    main?: boolean[]
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
    name?: number
    code?: number
    main?: number
    priority?: number
    active?: number
    createdAt?: number
    updatedAt?: number
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export async function getLanguages(params: getLanguagesParams) {
  return api.get<LanguagesResponse>('languages/get', { params })
}

export interface createLanguagesParams {
  name: string
  code: string
  main?: boolean
  priority: number
  active?: boolean
}

export async function createLanguage(params: createLanguagesParams) {
  return api.post<LanguagesResponse>('languages/create', { ...params })
}

export interface editLanguageParams {
  _id: string
  name: string
  code: string
  main?: boolean
  priority: number
  active?: boolean
}

export async function editLanguage(params: editLanguageParams) {
  return api.post<LanguagesResponse>('languages/edit', params)
}

export interface removeLanguageParams {
  _ids: string[]
}

export async function removeLanguage(params: removeLanguageParams) {
  return api.post<LanguagesResponse>('languages/remove', params)
}

interface batchItem {
  id: string
  column: string
  value: string | number | boolean | Record<string, string>
}

interface batchFilterItem {
  filters?: {
    name?: string
    code?: string
    active?: boolean[]
    main?: boolean[]
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
}

export interface batchLanguageParams {
  _ids: string[]
  params: batchItem[]
  filters: batchFilterItem[]
}

export async function batchLanguage(params: batchLanguageParams) {
  return api.post<LanguagesResponse>('languages/batch', params)
}

export interface importLanguagesParams {
  file: File
}

export async function importLanguages(params: importLanguagesParams) {
  return api.post<LanguagesResponse>('languages/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export interface duplicateLanguageParams {
  _ids: string[]
}

export async function duplicateLanguage(params: duplicateLanguageParams) {
  return api.post<LanguagesResponse>('languages/duplicate', params)
}
