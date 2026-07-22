import type { NextFunction, Response } from 'express'
import type {
  CreateWarehouseTransactionPayload,
  EditWarehouseTransactionPayload,
  GetWarehouseTransactionDetailsPayload,
  GetWarehouseTransactionsItemsPayload,
  GetWarehouseTransactionsPayload,
  ReceiveWarehouseTransactionPayload,
  RemoveWarehouseTransactionsPayload,
  ScanBarcodeToDraftPayload,
  ValidatedAuthedRequest,
  ValidatedRequest,
} from '@/types/'
import * as WarehouseTransactionService from '@/services/warehouse-transaction.service'

export async function get(
  req: ValidatedAuthedRequest<GetWarehouseTransactionsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseTransactionService.get({
      payload: req.validated.query,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getItems(
  req: ValidatedRequest<GetWarehouseTransactionsItemsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseTransactionService.getItems({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getDetails(
  req: ValidatedRequest<GetWarehouseTransactionDetailsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseTransactionService.getDetails({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function scanBarcodeToDraft(
  req: ValidatedRequest<ScanBarcodeToDraftPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseTransactionService.scanBarcodeToDraft({ payload: req.validated.body })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedAuthedRequest<CreateWarehouseTransactionPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseTransactionService.create({
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
  req: ValidatedRequest<EditWarehouseTransactionPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseTransactionService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedAuthedRequest<RemoveWarehouseTransactionsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseTransactionService.remove({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function receive(
  req: ValidatedAuthedRequest<ReceiveWarehouseTransactionPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseTransactionService.receive({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
