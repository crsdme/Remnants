import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface SettingDTO {
  id: IdType
  value: string
  description: string
  scope: string
  key: string
  createdAt: Date
  updatedAt: Date
}

export type GetSettingsResponse = ResponseList<SettingDTO>

export type CreateSettingResponse = ResponseItem<SettingDTO>

export type EditSettingResponse = ResponseItem<SettingDTO>

export type RemoveSettingsResponse = Response
