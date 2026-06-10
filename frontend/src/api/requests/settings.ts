import type {
  EditSettingRequest,
  EditSettingResponse,
  GetSettingsRequest,
  GetSettingsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getSettings(params: GetSettingsRequest) {
  return api.get<GetSettingsResponse>('settings/get', { params })
}

export async function editSetting(params: EditSettingRequest) {
  return api.post<EditSettingResponse>('settings/edit', params)
}
