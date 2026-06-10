import type { SettingDTO } from '@remnant/shared'
import type { SettingDB } from '@/types/'

export function mapSettingToDTO(setting: SettingDB): SettingDTO {
  return {
    id: setting._id,
    key: setting.key,
    value: setting.value,
    scope: setting.scope,
    description: setting.description,
    createdAt: setting.createdAt,
    updatedAt: setting.updatedAt,
  }
}
