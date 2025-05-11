import type { NextFunction, Request, Response } from 'express'
import * as AuthService from '../services/auth.service'

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken, user } = await AuthService.login(
      req.body,
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 12 * 60 * 60 * 1000,
      path: '/',
    })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
      path: '/',
    })

    res.status(200).json({ user })
  }
  catch (err) {
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })

    res.status(200).json({ message: 'Logged out' })
  }
  catch (err) {
    next(err)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      res.sendStatus(403)
      return
    }

    const { accessToken } = await AuthService.refresh({ refreshToken })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
      path: '/',
    })

    res.status(200).json({ status: 'success' })
  }
  catch (err) {
    next(err)
  }
}
