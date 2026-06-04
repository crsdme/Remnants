import type {
  LanguageString,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  createProductPropertySchema,
  editProductPropertySchema,
  getProductPropertySchema,
  removeProductPropertySchema,
} from '@remnant/shared'

export interface ProductPropertyDB {
  _id: string
  names: LanguageString
  symbols: LanguageString
  options: string[]
  priority: number
  type: 'text' | 'select' | 'color' | 'number' | 'boolean' | 'multiSelect'
  isRequired: boolean
  showInTable: boolean
  showInStatistics: boolean
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

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
