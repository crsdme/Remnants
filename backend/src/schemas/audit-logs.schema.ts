import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const auditLogDBSchema = z.object({
  _id: idSchema,
  resourceType: z.string(),
  resourceId: idSchema,
  action: z.string(),
  changes: z.array(z.object({
    path: z.string(),
    before: z.unknown(),
    after: z.unknown(),
  })),
  comment: z.string().optional(),
  createdBy: idSchema.optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  resource: z.unknown().optional(),
})
