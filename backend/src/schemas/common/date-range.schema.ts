import { z } from 'zod'

export const dateRangeSchema = z.object({
  from: z.preprocess((val) => {
    if (!val || (typeof val !== 'string' && typeof val !== 'number'))
      return undefined
    return new Date(val)
  }, z.date().optional()),
  to: z.preprocess((val) => {
    if (!val || (typeof val !== 'string' && typeof val !== 'number'))
      return undefined
    return new Date(val)
  }, z.date().optional()),
})
