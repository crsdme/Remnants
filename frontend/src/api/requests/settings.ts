import type {
  editSettingParams,
  getSettingsParams,
  SettingsResponse,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getSettings(params: getSettingsParams) {
  return api.get<SettingsResponse>('settings/get', { params })
}

export async function editSetting(params: editSettingParams) {
  return api.post<SettingsResponse>('settings/edit', params)
}
