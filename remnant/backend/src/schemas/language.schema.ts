import { z } from 'zod'

export const getLanguageSchema = z.object({
  pagination: z.object({
    full: z.preprocess(val => Boolean(val), z.boolean()),
    current: z.preprocess(val => Number(val), z.number()).optional(),
    pageSize: z.preprocess(val => Number(val), z.number()).optional(),
  }),
})
