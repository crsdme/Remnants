import type { responseSchema } from './common/'
import { z } from 'zod'
import { dateRangeSchema } from './common/'

export const getStatisticSchema = z.object({
  filters: z.object({
    date: dateRangeSchema,
    cashregister: z.array(z.string()).optional(),
    cashregisterAccount: z.array(z.string()).optional(),
  }).optional().default({
    date: {
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  }),
})

export type GetOrderStatisticRequest = z.input<typeof getStatisticSchema>

export type GetStatisticResponse = z.infer<typeof responseSchema>
