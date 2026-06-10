import type {
  LanguageString,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  createProductPropertyGroupSchema,
  editProductPropertyGroupSchema,
  getProductPropertyGroupSchema,
  removeProductPropertyGroupSchema,
} from '@remnant/shared'

export interface ProductPropertyGroupDB {
  _id: string
  names: LanguageString
  productProperties: string[]
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetProductPropertyGroupsPayload = z.output<typeof getProductPropertyGroupSchema>
export function parseGetProductPropertyGroups(x: unknown): GetProductPropertyGroupsPayload {
  return getProductPropertyGroupSchema.parse(x)
}

export type CreateProductPropertyGroupPayload = z.output<typeof createProductPropertyGroupSchema>
export function parseCreateProductPropertyGroup(x: unknown): CreateProductPropertyGroupPayload {
  return createProductPropertyGroupSchema.parse(x)
}

export type EditProductPropertyGroupPayload = z.output<typeof editProductPropertyGroupSchema>
export function parseEditProductPropertyGroup(x: unknown): EditProductPropertyGroupPayload {
  return editProductPropertyGroupSchema.parse(x)
}

export type RemoveProductPropertyGroupPayload = z.output<typeof removeProductPropertyGroupSchema>
export function parseRemoveProductPropertyGroup(x: unknown): RemoveProductPropertyGroupPayload {
  return removeProductPropertyGroupSchema.parse(x)
}

export type GetProductPropertyGroupsRepoPayload = GetProductPropertyGroupsPayload

export type CreateProductPropertyGroupRepoPayload = CreateProductPropertyGroupPayload

export type EditProductPropertyGroupRepoPayload = EditProductPropertyGroupPayload
