import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import sharp from 'sharp'
import { STORAGE_PATHS } from '../../config/constants'
import { HttpError } from '../../utils/httpError'

const router = Router()

// router.get('/:filename', (req: any, res: any) => {
//   const { filename } = req.params
//   const width = Number.parseInt(req.query.width as string)
//   const height = Number.parseInt(req.query.height as string)
//   const imagePath = path.join(STORAGE_PATHS.productImages, filename)

//   if (!fs.existsSync(imagePath))
//     throw new HttpError(404, 'Image not found')

//   try {
//     const transform = sharp(imagePath)

//     if (!Number.isNaN(width) || !Number.isNaN(height)) {
//       transform.resize({
//         width: !Number.isNaN(width) ? width : undefined,
//         height: !Number.isNaN(height) ? height : undefined,
//         fit: 'cover',
//       })
//     }
//     res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
//     res.setHeader('Access-Control-Allow-Origin', '*')
//     res.set('Content-Type', 'image/jpeg')
//     transform.pipe(res)
//   }
//   catch (err) {
//     throw new HttpError(500, 'Failed to process image', err as string)
//   }
// })

router.get('/:filename', async (req: any, res: any) => {
  const { filename } = req.params
  const width = Number.parseInt(req.query.width)
  const height = Number.parseInt(req.query.height)
  const imagePath = path.join(STORAGE_PATHS.productImages, filename)

  // if (!fs.existsSync(imagePath))
  // throw new HttpError(404, 'Image not found')

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
