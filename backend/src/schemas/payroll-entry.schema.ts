import {
  idSchema,
  idSchemaOptional,
  payrollEntryTypeSchema,
  workDateSchema,
} from '@remnant/shared'
import { z } from 'zod'

export const payrollEntryDBSchema = z.object({
  _id: idSchema,
  userId: idSchema,
  type: payrollEntryTypeSchema,
  workDate: workDateSchema,
  minorAmount: z.number(),
  currencyId: idSchemaOptional,
  workShiftId: idSchemaOptional,
  periodStart: workDateSchema.optional(),
  periodEnd: workDateSchema.optional(),
  comment: z.string().optional().default(''),
  createdBy: idSchemaOptional,
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
