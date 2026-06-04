import { z } from 'zod'

export const languageStringSchema = z.object(
  ['ru', 'en'].reduce((acc, lang) => {
    acc[lang] = z.string().trim().optional()
    return acc
  }, {} as Record<string, z.ZodTypeAny>),
)
