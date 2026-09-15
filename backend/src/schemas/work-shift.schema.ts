import {
  idSchema,
  idSchemaOptional,
  workDateSchema,
  workScheduleSchema,
  workShiftStatusSchema,
} from '@remnant/shared'
import { z } from 'zod'

export const workShiftDBSchema = z.object({
  _id: idSchema,
  userId: idSchema,
  workDate: workDateSchema,
  status: workShiftStatusSchema, // planned | started | completed | absent
  startedAt: z.coerce.date().nullable().optional(),
  finishedAt: z.coerce.date().nullable().optional(),
  plannedSchedule: workScheduleSchema.nullable().optional(),
  earlyBonusMinor: z.number().default(0),
  latePenaltyMinor: z.number().default(0),
  salaryMinor: z.number().default(0),
  markedByUserId: idSchemaOptional,
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
