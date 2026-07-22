import type {
  QuantityDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { quantityDBSchema } from '../schemas'
import {
  countQuantitiesSchema,
  createQuantitiesSchema,
  editQuantitiesSchema,
  getQuantitiesSchema,
  removeQuantitiesSchema,
} from '@remnant/shared'

export type QuantityDB = z.infer<typeof quantityDBSchema>

export type CreateQuantityPayload = z.output<typeof createQuantitiesSchema>
export function parseCreateQuantity(x: unknown): CreateQuantityPayload {
  return createQuantitiesSchema.parse(x)
}

export type EditQuantityPayload = z.output<typeof editQuantitiesSchema>
export function parseEditQuantity(x: unknown): EditQuantityPayload {
  return editQuantitiesSchema.parse(x)
}

export type RemoveQuantityPayload = z.output<typeof removeQuantitiesSchema>
export function parseRemoveQuantity(x: unknown): RemoveQuantityPayload {
  return removeQuantitiesSchema.parse(x)
}

export type GetQuantitiesPayload = z.output<typeof getQuantitiesSchema>
export function parseGetQuantities(x: unknown): GetQuantitiesPayload {
  return getQuantitiesSchema.parse(x)
}

export type GetQuantitiesRepoPayload = GetQuantitiesPayload
export interface GetQuantitiesRepoResult { items: QuantityDTO[], total: number, page: number, pageSize: number }

export type CreateQuantityRepoPayload = CreateQuantityPayload

export type EditQuantityRepoPayload = EditQuantityPayload

export type CountQuantitiesPayload = z.output<typeof countQuantitiesSchema>
export function parseCountQuantities(x: unknown): CountQuantitiesPayload {
  return countQuantitiesSchema.parse(x)
}
