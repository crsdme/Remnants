import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import sharp from 'sharp'
import { STORAGE_PATHS } from '../../config/constants'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = express.Router()

const authenticateJWT = authMiddleware()

router.get('/products/images/:filename', authenticateJWT, (req: any, res: any) => {
  const { filename } = req.params
  const width = Number.parseInt(req.query.width as string)
  const height = Number.parseInt(req.query.height as string)

  const imagePath = path.join(STORAGE_PATHS.productImages, filename)
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Access-Control-Allow-Origin', '*')
  console.log(imagePath)
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: 'Image not found' })
  }

  try {
    const transform = sharp(imagePath)

    if (!Number.isNaN(width) || !Number.isNaN(height)) {
      transform.resize({
        width: !Number.isNaN(width) ? width : undefined,
        height: !Number.isNaN(height) ? height : undefined,
        fit: 'cover',
      })
    }

    res.set('Content-Type', 'image/jpeg') // или определяй по расширению, если нужно
    transform.pipe(res)
  }
  catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to process image' })
  }
})

export default router
