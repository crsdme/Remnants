import type { z } from 'zod'
import type { productPropertyDBSchema } from '../schemas'
import {
  createProductPropertySchema,
  editProductPropertySchema,
  getProductPropertySchema,
  removeProductPropertySchema,
} from '@remnant/shared'

export type ProductPropertyDB = z.infer<typeof productPropertyDBSchema>

export type GetProductPropertiesPayload = z.output<typeof getProductPropertySchema>
export function parseGetProductProperties(x: unknown): GetProductPropertiesPayload {
  return getProductPropertySchema.parse(x)
}

export type CreateProductPropertyPayload = z.output<typeof createProductPropertySchema>
export function parseCreateProductProperty(x: unknown): CreateProductPropertyPayload {
  return createProductPropertySchema.parse(x)
}

export type EditProductPropertyPayload = z.output<typeof editProductPropertySchema>
export function parseEditProductProperty(x: unknown): EditProductPropertyPayload {
  return editProductPropertySchema.parse(x)
}

export type RemoveProductPropertiesPayload = z.output<typeof removeProductPropertySchema>
export function parseRemoveProductProperties(x: unknown): RemoveProductPropertiesPayload {
  return removeProductPropertySchema.parse(x)
}

export type GetProductPropertiesRepoPayload = GetProductPropertiesPayload

export type CreateProductPropertyRepoPayload = CreateProductPropertyPayload

export type EditProductPropertyRepoPayload = EditProductPropertyPayload
