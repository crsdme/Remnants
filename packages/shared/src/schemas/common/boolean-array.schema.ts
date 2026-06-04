import { z } from 'zod'

export const booleanArraySchema = z.preprocess((val) => {
  if (Array.isArray(val)) {
    return val.map(item => item === 'true')
  }
  if (typeof val === 'string') {
    return [val === 'true']
  }
  return val
}, z.array(z.boolean())).optional()
