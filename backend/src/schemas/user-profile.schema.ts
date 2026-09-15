import {
  bonusRuleSchema,
  idSchema,
  salarySettingsSchema,
  workScheduleSchema,
} from '@remnant/shared'
import { z } from 'zod'

export const userProfileDBSchema = z.object({
  _id: idSchema,
  userId: idSchema,
  hiredAt: z.coerce.date().nullable().optional(),
  defaultSchedule: workScheduleSchema.nullable().optional(),
  utcOffset: z.string(),
  salary: salarySettingsSchema,
  earlyBonus: bonusRuleSchema,
  latePenalty: bonusRuleSchema,
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
