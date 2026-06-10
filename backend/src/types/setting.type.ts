import type {
  SettingDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  createSettingSchema,
  editSettingSchema,
  getSettingsSchema,
  removeSettingSchema,
} from '@remnant/shared'

export interface SettingDB {
  _id: string
  key: string
  value: string
  scope: string
  isPublic: boolean
  description: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetSettingsPayload = z.output<typeof getSettingsSchema>
export function parseGetSettings(x: unknown): GetSettingsPayload {
  return getSettingsSchema.parse(x)
}

export type CreateSettingPayload = z.output<typeof createSettingSchema>
export function parseCreateSetting(x: unknown): CreateSettingPayload {
  return createSettingSchema.parse(x)
}

export type EditSettingPayload = z.output<typeof editSettingSchema>
export function parseEditSetting(x: unknown): EditSettingPayload {
  return editSettingSchema.parse(x)
}

export type RemoveSettingPayload = z.output<typeof removeSettingSchema>
export function parseRemoveSetting(x: unknown): RemoveSettingPayload {
  return removeSettingSchema.parse(x)
}

export type GetSettingsRepoPayload = GetSettingsPayload
export interface GetSettingsRepoResult { items: SettingDTO[], total: number, page: number, pageSize: number }

export type CreateSettingRepoPayload = CreateSettingPayload

export type EditSettingRepoPayload = EditSettingPayload
