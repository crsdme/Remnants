import type { SettingDTO } from '../schemas/setting.schema'
import type { UserDTO } from '../schemas/user.schema'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: UserDTO & { settings: SettingDTO[], permissions: string[] }
  settings: SettingDTO[]
  permissions: string[]
}

export interface RefreshResponse {
  accessToken: string
  permissions: string[]
}
