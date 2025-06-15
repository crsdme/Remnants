import { api } from '@/api/instance'

export interface postAuthLoginParams {
  login: string
  password: string
  type: string
}

export async function postAuthLogin(params: postAuthLoginParams) {
  return api.post<authLoginResponse>('auth/login', { ...params })
}

export const postRefreshToken = async () => api.post<refreshTokenResponse>('auth/refresh')

export const postAuthLogout = async () => api.post<refreshTokenResponse>('auth/logout')
