import type { NextFunction, Response } from 'express'
import type { GetPaymentApplicationsPayload, ValidatedAuthedRequest } from '@/types/'
import * as PaymentApplicationService from '@/services/payment-application.service'

export async function get(
  req: ValidatedAuthedRequest<GetPaymentApplicationsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await PaymentApplicationService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
