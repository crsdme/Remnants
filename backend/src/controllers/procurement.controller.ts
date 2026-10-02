import type { NextFunction, Response } from 'express'
import type {
  CancelProcurementPaymentPayload,
  ConfirmProcurementPayload,
  CreateProcurementPayload,
  EditProcurementPayload,
  GetProcurementItemsPayload,
  GetProcurementsPayload,
  PayProcurementPayload,
  PaySupplierPayload,
  RemoveProcurementsPayload,
  ScanBarcodeProcurementPayload,
  UnconfirmProcurementPayload,
  ValidatedAuthedRequest,
} from '@/types'
import * as ProcurementService from '@/services/procurement.service'

export async function get(
  req: ValidatedAuthedRequest<GetProcurementsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProcurementService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getItems(
  req: ValidatedAuthedRequest<GetProcurementItemsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProcurementService.getItems({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedAuthedRequest<never, CreateProcurementPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProcurementService.create({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedAuthedRequest<never, EditProcurementPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProcurementService.edit({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedAuthedRequest<never, RemoveProcurementsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProcurementService.remove({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function scanBarcode(
  req: ValidatedAuthedRequest<ScanBarcodeProcurementPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProcurementService.scanBarcode({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function pay(
  req: ValidatedAuthedRequest<never, PayProcurementPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProcurementService.pay({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function cancelPayment(
  req: ValidatedAuthedRequest<never, CancelProcurementPaymentPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProcurementService.cancelPayment({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function paySupplier(
  req: ValidatedAuthedRequest<never, PaySupplierPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProcurementService.paySupplier({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function confirm(
  req: ValidatedAuthedRequest<never, ConfirmProcurementPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProcurementService.confirm({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function unconfirm(
  req: ValidatedAuthedRequest<never, UnconfirmProcurementPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProcurementService.unconfirm({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
