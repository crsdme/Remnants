import type { Code, IdType, Message, Status } from './common.type'

export interface Setting {
  id: IdType
  value: string
  description: string
  scope: string
  key: string
  createdAt: Date
  updatedAt: Date
}
export interface getSettingsResult {
  status: Status
  code: Code
  message: Message
  settings: Setting[]
  settingsCount: number
}

interface getSettingsFilters {
  key: string
  scope: string
  isPublic: boolean
}

export interface getSettingsParams {
  filters?: Partial<getSettingsFilters>
}

export interface createSettingResult {
  status: Status
  code: Code
  message: Message
  setting: Setting
}

export interface createSettingParams {
  key: string
  value: string
  description: string
  scope: string
}

export interface editSettingResult {
  status: Status
  code: Code
  message: Message
  setting: Setting
}

export interface editSettingParams {
  key: string
  value: string
  description: string
  scope: string
}

export interface removeSettingsResult {
  status: Status
  code: Code
  message: Message
}
