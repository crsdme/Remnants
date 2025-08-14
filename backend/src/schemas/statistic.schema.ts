import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema } from './common/'

extendZodWithOpenApi(z)

export const getStatisticSchema = z.object({
  filters: z.object({
    date: dateRangeSchema,
    cashregister: z.string().trim().optional(),
    cashregisterAccount: z.string().trim().optional(),
  }).optional().default({
    date: {
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  }),
})
