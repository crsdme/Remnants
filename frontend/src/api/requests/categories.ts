import type {
  CreateCategoryRequest,
  CreateCategoryResponse,
  EditCategoryRequest,
  EditCategoryResponse,
  GetCategoriesRequest,
  GetCategoriesResponse,
  RemoveCategoriesRequest,
  RemoveCategoriesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getCategories(params: GetCategoriesRequest) {
  return api.get<GetCategoriesResponse>('categories/get', { params })
}

export async function createCategory(params: CreateCategoryRequest) {
  return api.post<CreateCategoryResponse>('categories/create', { ...params })
}

export async function editCategory(params: EditCategoryRequest) {
  return api.post<EditCategoryResponse>('categories/edit', params)
}

export async function removeCategory(params: RemoveCategoriesRequest) {
  return api.post<RemoveCategoriesResponse>('categories/remove', params)
}
