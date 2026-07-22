import type {
  WarehouseDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { warehouseDBSchema } from '../schemas'
import {
  createWarehousesSchema,
  editWarehousesSchema,
  getWarehousesSchema,
  removeWarehousesSchema,
} from '@remnant/shared'

export type WarehouseDB = z.infer<typeof warehouseDBSchema>

export type GetWarehousesPayload = z.output<typeof getWarehousesSchema>
export function parseGetWarehouses(x: unknown): GetWarehousesPayload {
  return getWarehousesSchema.parse(x)
}

export type CreateWarehousePayload = z.output<typeof createWarehousesSchema>
export function parseCreateWarehouse(x: unknown): CreateWarehousePayload {
  return createWarehousesSchema.parse(x)
}

export type EditWarehousePayload = z.output<typeof editWarehousesSchema>
export function parseEditWarehouse(x: unknown): EditWarehousePayload {
  return editWarehousesSchema.parse(x)
}

export type RemoveWarehousesPayload = z.output<typeof removeWarehousesSchema>
export function parseRemoveWarehouses(x: unknown): RemoveWarehousesPayload {
  return removeWarehousesSchema.parse(x)
}

export type GetWarehousesRepoPayload = GetWarehousesPayload
export interface GetWarehousesRepoResult { items: WarehouseDTO[], total: number, page: number, pageSize: number }

export type CreateWarehouseRepoPayload = CreateWarehousePayload

export type EditWarehouseRepoPayload = EditWarehousePayload
