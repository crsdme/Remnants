import { api } from '@/api/instance'

export interface getCategoriesParams {
  filters?: {
    names: string
    language: string
    flat?: boolean
  }
  // sorters: {
  //   current: number;
  //   pageSize: number;
  // };
  pagination?: {
    current: number
    pageSize: number
  }
}

export async function getCategories(params: getCategoriesParams) {
  return api.get<CategoriesResponse>('categories/get', { params })
}

export type createCategoriesParams = Category

export async function createCategory(params: createCategoriesParams) {
  return api.post<CategoriesResponse>('categories/create', { ...params })
}

export type editCategoryParams = Category

export async function editCategory(params: editCategoryParams) {
  return api.post<CategoriesResponse>('categories/edit', params)
}

export interface removeCategoryParams {
  _id: string
}

export async function removeCategory(params: removeCategoryParams) {
  return api.post<CategoriesResponse>('categories/remove', params)
}
