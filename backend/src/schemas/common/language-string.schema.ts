import { z } from 'zod'
import { SUPPORTED_LANGUAGES } from '../../config/constants'

export const languageStringSchema = z.object(
  SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    acc[lang] = z.string().trim().optional()
    return acc
  }, {} as Record<string, z.ZodTypeAny>),
)
