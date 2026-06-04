export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: object
}

export interface RefreshResponse {
  accessToken: string
  permissions: string[]
}
