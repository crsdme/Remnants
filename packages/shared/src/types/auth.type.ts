export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    login: string
    name: string
    permissions: string[]
    createdAt: Date
    updatedAt: Date
  } & {
    settings: {
      value: string
      key: string
    }[]
    permissions: string[]
  }
}

export interface RefreshResponse {
  accessToken: string
  permissions: string[]
}
