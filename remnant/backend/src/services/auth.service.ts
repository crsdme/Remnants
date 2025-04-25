import type { IUser } from '../models/user'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import User from '../models/user'

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

  const user = await User.findOne({ login })

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

  return { accessToken, refreshToken, user }
}

interface refreshParams {
  refreshToken: string
}

interface refreshResult {
  accessToken: string
}

export async function refresh(payload: refreshParams): Promise<refreshResult> {
  const accessToken = generateAccessToken({ id: 'test' })
  return { accessToken }
}

export async function register(email: string, password: string): Promise<IUser> {
  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser = new User({ email, password: hashedPassword })
  await newUser.save()
  return newUser
}
