import { z } from 'zod'

function mapToPlainObject(value: unknown): unknown {
  if (value instanceof Map)
    return Object.fromEntries(value.entries())

  return value
}

export const languageStringSchema = z.preprocess(
  mapToPlainObject,
  z.object({
    ru: z.string().trim().optional(),
    en: z.string().trim().optional(),
  }),
)
