import type { NextFunction, Request, Response } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import sharp from 'sharp'
import { STORAGE_PATHS } from '@/config/constants'
import { HttpError } from '@/utils/httpError'

const router = Router()

router.get('/:filename', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params as { filename: string }
    const query = req.query as { width?: string, height?: string }

    const width = query.width !== undefined ? Number.parseInt(query.width, 10) : undefined
    const height = query.height !== undefined ? Number.parseInt(query.height, 10) : undefined
    const hasResize = (width !== undefined && !Number.isNaN(width)) || (height !== undefined && !Number.isNaN(height))

    const imagePath = path.join(STORAGE_PATHS.productImages, filename)

    if (!fs.existsSync(imagePath))
      throw new HttpError(404, 'Image not found')

    const cacheKey = hasResize
      ? `${filename}-${width ?? 'auto'}x${height ?? 'auto'}.jpg`
      : `${filename}-original.jpg`
    const cachedPath = path.join(STORAGE_PATHS.cacheProductImages, cacheKey)

    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.set('Content-Type', 'image/jpeg')

    if (fs.existsSync(cachedPath))
      return fs.createReadStream(cachedPath).pipe(res)

    let transform = sharp(imagePath)

    if (hasResize) {
      transform = transform.resize({
        width: width !== undefined && !Number.isNaN(width) ? width : undefined,
        height: height !== undefined && !Number.isNaN(height) ? height : undefined,
        fit: 'cover',
      })
    }

    const cacheStream = fs.createWriteStream(cachedPath)
    transform.clone().jpeg().pipe(cacheStream)
    transform.jpeg().pipe(res)
  }
  catch (err) {
    next(err)
  }
})

export default router
