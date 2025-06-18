import type { NextFunction, Request, Response } from 'express'
import * as ProductPropertyService from '../services/product-property.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await ProductPropertyService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await ProductPropertyService.create(req.body)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await ProductPropertyService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await ProductPropertyService.remove(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

// export async function batch(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await ProductPropertyService.batch(req.body)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function duplicate(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await ProductPropertyService.duplicate(req.body)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function importHandler(req: Request, res: Response, next: NextFunction) {
//   try {
//     if (!req.file) {
//       throw new HttpError(400, 'No file uploaded', 'NO_FILE_UPLOADED')
//     }

//     const serviceResponse = await ProductPropertyService.importHandler({ file: req.file })

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function exportHandler(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await ProductPropertyService.exportHandler(req.body)
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
//     res.setHeader('X-Export-Code', serviceResponse.code)
//     res.setHeader('X-Export-Message', serviceResponse.message)
//     res.setHeader('Access-Control-Expose-Headers', 'x-export-code, x-export-message')
//     res.send(serviceResponse.buffer)
//   }
//   catch (err) {
//     next(err)
//   }
// }
