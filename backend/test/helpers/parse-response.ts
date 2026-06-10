import type { z, ZodTypeDef } from 'zod'
import { expect } from 'vitest'

export function parseResponse<TOutput>(
  schema: z.ZodType<TOutput, ZodTypeDef, unknown>,
  response: unknown,

): TOutput {
  const parsed = schema.safeParse(response)

  if (!parsed.success) {
    console.dir(parsed.error.format(), { depth: null })
    console.dir(response, { depth: null })

    throw new Error('Response does not match schema')
  }

  expect(parsed.success).toBe(true)
  if (!parsed.success)
    throw new Error('Response does not match schema')

  return parsed.data
}
