export interface postAuthLoginParams {
  login: string
  password: string
  type: string
}

export interface authLoginResponse {
  status: string
  accessToken: string
  user: User & { settings: Setting[] }
}

export interface refreshTokenResponse {
  status: string
  accessToken: string
  permissions: Array<string>
}
