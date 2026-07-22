import type { z } from 'zod'
import type { productPropertyGroupDBSchema } from '../schemas'
import {
  createProductPropertyGroupSchema,
  editProductPropertyGroupSchema,
  getProductPropertyGroupSchema,
  removeProductPropertyGroupSchema,
} from '@remnant/shared'

export type ProductPropertyGroupDB = z.infer<typeof productPropertyGroupDBSchema>

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
