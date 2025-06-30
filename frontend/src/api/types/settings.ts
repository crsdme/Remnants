export interface getSettingsParams {
  filters?: {
    key?: string
    scope?: string
  }
}

export interface editSettingParams {
  key: string
  value: string
  description: string
  scope: string
}

export interface SettingsResponse {
  status: string
  code: string
  message: string
  description: string
  settings: Setting[]
  settingsCount: number
}
