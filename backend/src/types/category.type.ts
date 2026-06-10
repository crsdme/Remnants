import type {
  CategoryDTO,
  LanguageString,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  createCategorySchema,
  editCategorySchema,
  getCategoriesSchema,
  removeCategoriesSchema,
} from '@remnant/shared'

export interface CategoryDB {
  _id: string
  seq: number
  names: LanguageString
  parent?: string
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetCategoriesPayload = z.output<typeof getCategoriesSchema>
export function parseGetCategories(x: unknown): GetCategoriesPayload {
  return getCategoriesSchema.parse(x)
}

export type CreateCategoryPayload = z.output<typeof createCategorySchema>
export function parseCreateCategory(x: unknown): CreateCategoryPayload {
  return createCategorySchema.parse(x)
}

export type EditCategoryPayload = z.output<typeof editCategorySchema>
export function parseEditCategory(x: unknown): EditCategoryPayload {
  return editCategorySchema.parse(x)
}

export type RemoveCategoriesPayload = z.output<typeof removeCategoriesSchema>
export function parseRemoveCategories(x: unknown): RemoveCategoriesPayload {
  return removeCategoriesSchema.parse(x)
}

export type GetCategoriesRepoPayload = GetCategoriesPayload
export interface GetCategoriesRepoResult { items: CategoryDTO[], total: number, page: number, pageSize: number }

export type CreateCategoriesRepoPayload = CreateCategoryPayload

export type EditCategoriesRepoPayload = EditCategoryPayload
