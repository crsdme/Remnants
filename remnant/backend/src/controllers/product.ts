import type { NextFunction, Request, Response } from 'express'
import * as ProductService from '../services/product.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const { filters } = req.body

    const products = await ProductService.get({ filters })

    res.status(200).json(products)
  }
  catch (err) {
    next(err)
  }
}
