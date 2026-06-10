import type { Request, Response } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import sharp from 'sharp'
import { STORAGE_PATHS } from '@/config/constants'
import { HttpError } from '@/utils/httpError'

const router = Router()

router.get('/:filename', async (req: Request, res: Response) => {
  const { filename } = req.params as { filename: string }
  const query = req.query as { width: string, height: string }

  const width = Number.parseInt(query.width || '100')
  const height = Number.parseInt(query.height || '100')
  const imagePath = path.join(STORAGE_PATHS.productImages, filename)

  if (!fs.existsSync(imagePath))
    throw new HttpError(404, 'Image not found')

  const cacheKey = `${filename}-${width || 'auto'}x${height || 'auto'}.jpg`
  const cachedPath = path.join(STORAGE_PATHS.cacheProductImages, cacheKey)

  if (fs.existsSync(cachedPath)) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.set('Content-Type', 'image/jpeg')
    return fs.createReadStream(cachedPath).pipe(res)
  }

  try {
    let transform = sharp(imagePath)

    if (!Number.isNaN(width) || !Number.isNaN(height)) {
      transform = transform.resize({
        width: !Number.isNaN(width) ? width : undefined,
        height: !Number.isNaN(height) ? height : undefined,
        fit: 'cover',
      })
    }

    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.set('Content-Type', 'image/jpeg')

    const cacheStream = fs.createWriteStream(cachedPath)
    transform.clone().pipe(cacheStream)
    transform.pipe(res)
  }
  catch (err) {
    throw new HttpError(500, 'Failed to process image', err as string)
  }
})

export default router
