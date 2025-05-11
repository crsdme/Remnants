import type { NextFunction, Request, Response } from 'express'
import path from 'node:path'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4()
    const fileExt = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${fileExt}`)
  },
})

function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/csv',
    'text/xlsx',
    'text/xls',
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]

  console.log(file.mimetype)

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  }
  else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, GIF, PDF, CSV, XLSX, XLS and JSON files are allowed.',
      ),
    )
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

export function uploadSingle(fieldName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message })
      }
      else if (err) {
        return res.status(400).json({ error: err.message })
      }
      next()
    })
  }
}

export function uploadMultiple(fieldName: string, maxCount: number = 5) {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message })
      }
      else if (err) {
        return res.status(400).json({ error: err.message })
      }
      next()
    })
  }
}
