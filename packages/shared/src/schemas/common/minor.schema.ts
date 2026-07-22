import { z } from 'zod'

export const minorNumberSchema = z.number().brand<'Minor'>()

export type Minor = z.infer<typeof minorNumberSchema>

export const minorSchema = z.preprocess((val) => {
  const num = Number(val)
  if (Number.isNaN(num)) {
    return undefined
  }
  return num
}, minorNumberSchema)

export function toMinorType(value: number): Minor {
  return minorNumberSchema.parse(value)
}
