import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const getSettingSchema = z.object({
  filters: z.object({
    key: z.string().trim().optional(),
    scope: z.string().trim().optional(),
  }).optional().default({}),
})

export const editSettingSchema = z.object({
  key: z.string().trim(),
  value: z.any().optional().default(null),
})
