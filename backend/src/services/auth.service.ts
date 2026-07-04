import type { LoginResponse, RefreshResponse } from '@remnant/shared'
import type { LoginPayload, RefreshPayload, TokenPayload } from '@/types'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import * as UserRepository from '@/repositories/users.repo'
import * as SettingsService from '@/services/setting.service'
import { HttpError } from '@/utils/'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '15m'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '12h'

function generateRefreshToken(data: TokenPayload) {
  return jwt.sign(data, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

function generateAccessToken(data: TokenPayload) {
  return jwt.sign(data, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { login, password } = payload

  const user = await UserRepository.findOne({ login })

  if (!user) {
    throw new HttpError(400, 'User not found', 'INVALID_CREDENTIALS')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new HttpError(400, 'Invalid password', 'INVALID_CREDENTIALS')
  }

  const accessToken = generateAccessToken({
    id: user._id,
    login: user.login,
    permissions: user.role.permissions,
  })
  const refreshToken = generateRefreshToken({
    id: user._id,
    login: user.login,
    permissions: user.role.permissions,
  })

  const { data: { items: settings } } = await SettingsService.get({ payload: { filters: { isPublic: true }, pagination: { current: 1, pageSize: 1000, full: true } } })
  const mappedSettings = settings.map(setting => ({
    key: setting.key,
    value: setting.value,
  }))

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      login: user.login,
      name: user.name,
      permissions: user.role.permissions,
      settings: mappedSettings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  }
}

export async function refresh(payload: RefreshPayload): Promise<RefreshResponse> {
  const userData = jwt.verify(payload.refreshToken, JWT_SECRET) as TokenPayload

  const accessToken = generateAccessToken({
    id: userData.id,
    login: userData.login,
    permissions: userData.permissions,
  })

  return {
    accessToken,
    permissions: userData.permissions ?? [],
  }
}
