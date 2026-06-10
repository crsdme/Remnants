import type {
  LanguageString,
  UnitDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  createUnitSchema,
  editUnitSchema,
  getUnitSchema,
  removeUnitSchema,
} from '@remnant/shared'

export interface UnitDB {
  _id: string
  seq: number
  names: LanguageString
  symbols: LanguageString
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetUnitsPayload = z.output<typeof getUnitSchema>
export function parseGetUnits(x: unknown): GetUnitsPayload {
  return getUnitSchema.parse(x)
}

export type CreateUnitPayload = z.output<typeof createUnitSchema>
export function parseCreateUnit(x: unknown): CreateUnitPayload {
  return createUnitSchema.parse(x)
}

export type EditUnitPayload = z.output<typeof editUnitSchema>
export function parseEditUnit(x: unknown): EditUnitPayload {
  return editUnitSchema.parse(x)
}

export type RemoveUnitsPayload = z.output<typeof removeUnitSchema>
export function parseRemoveUnits(x: unknown): RemoveUnitsPayload {
  return removeUnitSchema.parse(x)
}

export type GetUnitsRepoPayload = GetUnitsPayload
export interface GetUnitsRepoResult { items: UnitDTO[], total: number, page: number, pageSize: number }

export type CreateUnitRepoPayload = CreateUnitPayload

export type EditUnitRepoPayload = EditUnitPayload
