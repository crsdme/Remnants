import { idSchema, languageStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const productPropertyDBSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  optionIds: z.array(idSchema),
  priority: z.number(),
  type: z.enum(['text', 'select', 'color', 'number', 'boolean', 'multiSelect']),
  isRequired: z.boolean(),
  showInTable: z.boolean(),
  showInStatistics: z.boolean(),
  active: z.boolean(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
