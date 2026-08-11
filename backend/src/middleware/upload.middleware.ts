import type { NextFunction, Request, Response } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_PATHS } from '@/config/constants'

type UploadMode = 'single' | 'multiple' | 'fields'

interface UploadOptions {
  fieldName: string
  storageKey: keyof typeof STORAGE_PATHS
  mode?: UploadMode
  maxCount?: number
  allowedMimeTypes?: string[]
  allowedExtensions?: string[]
}

export function uploadMiddleware({
  fieldName,
  storageKey,
  mode = 'single',
  maxCount = 5,
  allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/csv',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  allowedExtensions,
}: UploadOptions) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = STORAGE_PATHS[storageKey]
      fs.mkdirSync(folder, { recursive: true })
      cb(null, folder)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = uuidv4()
      const fileExt = path.extname(file.originalname)
      cb(null, `${uniqueSuffix}${fileExt}`)
    },
  })

  const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const mimeAllowed = allowedMimeTypes.includes(file.mimetype)
    const extAllowed = allowedExtensions?.includes(ext) ?? false

    if (mimeAllowed || extAllowed) {
      cb(null, true)
    }
    else {
      cb(new Error('Invalid file type.'))
    }
  }

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  })

  return (req: Request, res: Response, next: NextFunction) => {
    const handler
      = mode === 'multiple'
        ? upload.array(fieldName, maxCount)
        : upload.single(fieldName)

    handler(req, res, (err) => {
      if (err instanceof multer.MulterError || err instanceof Error) {
        return res.status(400).json({ error: err.message })
      }
      next()
    })
  }
}
