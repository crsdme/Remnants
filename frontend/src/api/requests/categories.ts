import type {
  batchCategoryParams,
  CategoriesResponse,
  createCategoriesParams,
  duplicateCategoryParams,
  editCategoryParams,
  exportCategoriesParams,
  getCategoriesParams,
  importCategoriesParams,
  removeCategoryParams,
} from '@/api/types/categories'
import { api } from '@/api/instance'

export async function getCategories(params: getCategoriesParams) {
  return api.get<CategoriesResponse>('categories/get', { params })
}

export async function createCategory(params: createCategoriesParams) {
  return api.post<CategoriesResponse>('categories/create', { ...params })
}

export async function editCategory(params: editCategoryParams) {
  return api.post<CategoriesResponse>('categories/edit', params)
}

export async function removeCategory(params: removeCategoryParams) {
  return api.post<CategoriesResponse>('categories/remove', params)
}

export async function batchCategory(params: batchCategoryParams) {
  return api.post<CategoriesResponse>('categories/batch', params)
}

export async function importCategories(params: importCategoriesParams) {
  return api.post<CategoriesResponse>('categories/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function duplicateCategory(params: duplicateCategoryParams) {
  return api.post<CategoriesResponse>('categories/duplicate', params)
}

export async function exportCategories(params: exportCategoriesParams) {
  return api.post<Blob>('categories/export', params, {
    responseType: 'blob',
  })
}
