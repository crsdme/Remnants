import type { NextFunction, Response } from 'express'
import type {
  EditUserProfilePayload,
  GetUserProfilePayload,
  GetUserProfilesPayload,
  GetUserProfileSummaryPayload,
  ValidatedRequest,
} from '@/types'
import * as UserProfileService from '@/services/user-profile.service'

export async function get(
  req: ValidatedRequest<never, GetUserProfilesPayload>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await UserProfileService.get({
      payload: req.validated.query,
    })
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getOne(
  req: ValidatedRequest<never, GetUserProfilePayload>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await UserProfileService.getOne({
      payload: req.validated.query,
      user: req.user!,
    })
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function summary(
  req: ValidatedRequest<never, GetUserProfileSummaryPayload>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await UserProfileService.summary({
      payload: req.validated.query,
      user: req.user!,
    })
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditUserProfilePayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await UserProfileService.edit({
      payload: req.validated.body,
      user: req.user!,
    })
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
