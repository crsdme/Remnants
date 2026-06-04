import type { NextFunction, Response } from 'express'
import type {
  CreateAutomationPayload,
  EditAutomationPayload,
  GetAutomationsPayload,
  RemoveAutomationsPayload,
  ValidatedRequest,
} from '@/types'

import * as AutomationService from '@/services/automation.service'

export async function get(
  req: ValidatedRequest<GetAutomationsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await AutomationService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateAutomationPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await AutomationService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditAutomationPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await AutomationService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveAutomationsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await AutomationService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
