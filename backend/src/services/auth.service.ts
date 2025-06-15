import type { JwtPayload } from 'jsonwebtoken'
import type { PopulatedUser } from '../types/user.type'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/'
import { HttpError } from '../utils/httpError'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
// const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '12h'

function generateRefreshToken(data: any) {
  return jwt.sign(data, JWT_SECRET, { expiresIn: '12h' })
}

function generateAccessToken(data: any) {
  return jwt.sign(data, JWT_SECRET, { expiresIn: '15m' })
}

interface loginParams {
  login: string
  password: string
}

interface loginResult {
  accessToken: string
  refreshToken: string
  user: object
}

export async function login(payload: loginParams): Promise<loginResult> {
  const { login, password } = payload

  const user = await UserModel.findOne({ login }).populate('role') as PopulatedUser | null

  if (!user) {
    throw new HttpError(400, 'User not found', 'INVALID_CREDENTIALS')
  }

  const isMatch = await bcrypt.compare(password, user.password || '')

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

  const userData = {
    id: user._id,
    login: user.login,
    name: user.name,
    permissions: user.role.permissions,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

  return { accessToken, refreshToken, user: userData }
}

interface refreshParams {
  refreshToken: string
}

interface refreshResult {
  accessToken: string
  permissions: string[]
}

interface TokenPayload extends JwtPayload {
  id: string
}

export async function refresh(payload: refreshParams): Promise<refreshResult> {
  const userData = jwt.verify(payload.refreshToken, JWT_SECRET) as TokenPayload
  const accessToken = generateAccessToken({ id: userData.id, login: userData.login, permissions: userData.permissions })

  return { accessToken, permissions: userData.permissions || [] }
}
