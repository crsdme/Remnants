import type { NextFunction, Response } from 'express'
import type { ValidatedAuthedRequest, ValidatedRequest } from '@/types'
import type { CreateSitePayload, EditSitePayload, GetSitesPayload, RemoveSitesPayload, SyncSiteProductsPayload } from '@/types/'
import * as SiteService from '@/services/site.service'

export async function get(
  req: ValidatedAuthedRequest<GetSitesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await SiteService.get({
      payload: req.validated.query,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<CreateSitePayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await SiteService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditSitePayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await SiteService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveSitesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await SiteService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function syncProducts(
  req: ValidatedRequest<SyncSiteProductsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await SiteService.syncProducts({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
