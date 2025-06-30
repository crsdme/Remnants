import type { JwtPayload } from 'jsonwebtoken'
import type { IdType } from './common.type'

export interface loginParams {
  login: string
  password: string
}

export interface loginResult {
  accessToken: string
  refreshToken: string
  user: object
}

export interface refreshParams {
  refreshToken: string
}

export interface refreshResult {
  accessToken: string
  permissions: string[]
}

export interface TokenPayload extends JwtPayload {
  id: IdType
}
