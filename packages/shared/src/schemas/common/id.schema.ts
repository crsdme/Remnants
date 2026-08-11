import { z } from 'zod'

export const idSchemaOptional: z.ZodType<string | undefined, z.ZodTypeDef, unknown> = z.preprocess(
  value => (value === '' || value === null) ? undefined : value,
  z.string().uuid().optional(),
)

export const idSchema = z.string().uuid()
