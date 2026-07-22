import type { z } from 'zod'
import type { productPropertyOptionDBSchema } from '../schemas'
import {
  createProductPropertyOptionSchema,
  editProductPropertyOptionSchema,
  getProductPropertyOptionSchema,
  removeProductPropertyOptionSchema,
} from '@remnant/shared'

export type ProductPropertyOptionDB = z.infer<typeof productPropertyOptionDBSchema>

export type GetProductPropertyOptionsPayload = z.output<typeof getProductPropertyOptionSchema>
export function parseGetProductPropertyOptions(x: unknown): GetProductPropertyOptionsPayload {
  return getProductPropertyOptionSchema.parse(x)
}

export type CreateProductPropertyOptionPayload = z.output<typeof createProductPropertyOptionSchema>
export function parseCreateProductPropertyOption(x: unknown): CreateProductPropertyOptionPayload {
  return createProductPropertyOptionSchema.parse(x)
}

export type EditProductPropertyOptionPayload = z.output<typeof editProductPropertyOptionSchema>
export function parseEditProductPropertyOption(x: unknown): EditProductPropertyOptionPayload {
  return editProductPropertyOptionSchema.parse(x)
}

export type RemoveProductPropertyOptionsPayload = z.output<typeof removeProductPropertyOptionSchema>
export function parseRemoveProductPropertyOptions(x: unknown): RemoveProductPropertyOptionsPayload {
  return removeProductPropertyOptionSchema.parse(x)
}

export type GetProductPropertyOptionsRepoPayload = GetProductPropertyOptionsPayload

export type CreateProductPropertyOptionRepoPayload = CreateProductPropertyOptionPayload

export type EditProductPropertyOptionRepoPayload = EditProductPropertyOptionPayload
