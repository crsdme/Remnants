import { z } from 'zod'
import { numberFromStringSchema } from './number-from-string.schema'

export const paginationSchema = z.object({
  current: numberFromStringSchema.optional(),
  pageSize: numberFromStringSchema.optional(),
  full: z.string().transform(val => val === 'true').optional(),
})
