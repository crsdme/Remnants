import type { NextFunction, Request, Response } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import { STORAGE_PATHS } from '@/config/constants'
import { HttpError } from '@/utils/httpError'

const router = Router()

const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

router.get('/:filename', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params as { filename: string }
    const filePath = path.join(STORAGE_PATHS.expenseFiles, filename)

    if (!fs.existsSync(filePath))
      throw new HttpError(404, 'File not found')

    const ext = path.extname(filename).toLowerCase()
    const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream'

    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`)

    fs.createReadStream(filePath).pipe(res)
  }
  catch (err) {
    next(err)
  }
})

export default router
