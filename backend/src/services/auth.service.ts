import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

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

  const user = await UserModel.findOne({ login })

  if (!user) {
    throw new Error('User not found')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Invalid password')
  }

  const accessToken = generateAccessToken({ id: user._id, login: user.login })
  const refreshToken = generateRefreshToken({
    id: user._id,
    login: user.login,
  })

  const userData = {
    id: user._id,
    login: user.login,
    name: user.name,
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
}

export async function refresh(payload: refreshParams): Promise<refreshResult> {
  const accessToken = generateAccessToken({ id: payload.refreshToken })
  return { accessToken }
}
