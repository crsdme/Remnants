import type {
  ProductStockStatusDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { productStockStatusDBSchema } from '../schemas'
import {
  createProductStockStatusSchema,
  editProductStockStatusSchema,
  getProductStockStatusesSchema,
  removeProductStockStatusesSchema,
} from '@remnant/shared'

export type ProductStockStatusDB = z.infer<typeof productStockStatusDBSchema>

export type GetProductStockStatusesPayload = z.output<typeof getProductStockStatusesSchema>
export function parseGetProductStockStatuses(x: unknown): GetProductStockStatusesPayload {
  return getProductStockStatusesSchema.parse(x)
}

export type CreateProductStockStatusPayload = z.output<typeof createProductStockStatusSchema>
export function parseCreateProductStockStatus(x: unknown): CreateProductStockStatusPayload {
  return createProductStockStatusSchema.parse(x)
}

export type EditProductStockStatusPayload = z.output<typeof editProductStockStatusSchema>
export function parseEditProductStockStatus(x: unknown): EditProductStockStatusPayload {
  return editProductStockStatusSchema.parse(x)
}

export type RemoveProductStockStatusesPayload = z.output<typeof removeProductStockStatusesSchema>
export function parseRemoveProductStockStatuses(x: unknown): RemoveProductStockStatusesPayload {
  return removeProductStockStatusesSchema.parse(x)
}

export type GetProductStockStatusesRepoPayload = GetProductStockStatusesPayload
export interface GetProductStockStatusesRepoResult {
  items: ProductStockStatusDTO[]
  total: number
  page: number
  pageSize: number
}

export type CreateProductStockStatusRepoPayload = CreateProductStockStatusPayload

export type EditProductStockStatusRepoPayload = EditProductStockStatusPayload
