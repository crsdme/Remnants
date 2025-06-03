import { api } from '@/api/instance'

export interface getCategoriesParams {
  filters: {
    names?: string
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
  isTree?: boolean
}

export async function getCategories(params: getCategoriesParams) {
  return api.get<CategoriesResponse>('categories/get', { params })
}

export interface createCategoriesParams {
  names: LanguageString
  priority: number
  parent: string
  active?: boolean
}

export async function createCategory(params: createCategoriesParams) {
  return api.post<CategoriesResponse>('categories/create', { ...params })
}

export interface editCategoryParams {
  id: string
  names: LanguageString
  priority: number
  parent: string
  active?: boolean
}

export async function editCategory(params: editCategoryParams) {
  return api.post<CategoriesResponse>('categories/edit', params)
}

export interface removeCategoryParams {
  ids: string[]
}

export async function removeCategory(params: removeCategoryParams) {
  return api.post<CategoriesResponse>('categories/remove', params)
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

export interface batchCategoryParams {
  ids: string[]
  params: batchItem[]
  filters: batchFilterItem[]
}

export async function batchCategory(params: batchCategoryParams) {
  return api.post<CategoriesResponse>('categories/batch', params)
}

export interface importCategoriesParams {
  file: File
}

export async function importCategories(params: importCategoriesParams) {
  return api.post<CategoriesResponse>('categories/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export interface duplicateCategoryParams {
  ids: string[]
}

export async function duplicateCategory(params: duplicateCategoryParams) {
  return api.post<CategoriesResponse>('categories/duplicate', params)
}

export interface exportCategoriesParams {
  ids: string[]
}

export async function exportCategories(params: exportCategoriesParams) {
  return api.post<CategoriesResponse>('categories/export', params)
}
