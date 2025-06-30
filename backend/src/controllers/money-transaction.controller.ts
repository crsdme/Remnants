import type { NextFunction, Request, Response } from 'express'
import * as MoneyTransactionService from '../services/money-transaction.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await MoneyTransactionService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await MoneyTransactionService.create(req.body)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

// export async function edit(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await MoneyTransactionService.edit(req.body)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function remove(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await MoneyTransactionService.remove(req.body)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }
