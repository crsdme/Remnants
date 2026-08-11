import { z } from 'zod'
import { idSchema } from './common'

export const USER_ACCESS_SCOPE_KEYS = [
  'warehouseIds',
  'siteIds',
  'expenseCategoryIds',
  'cashregisterIds',
  'cashregisterAccountIds',
  'deliveryServiceIds',
  'orderSourceIds',
  'orderStatusIds',
] as const

export type UserAccessScopeKey = (typeof USER_ACCESS_SCOPE_KEYS)[number]

export const emptyUserAccessScopes = {
  warehouseIds: [] as string[],
  siteIds: [] as string[],
  expenseCategoryIds: [] as string[],
  cashregisterIds: [] as string[],
  cashregisterAccountIds: [] as string[],
  deliveryServiceIds: [] as string[],
  orderSourceIds: [] as string[],
  orderStatusIds: [] as string[],
}

export const userAccessScopesSchema = z.object({
  warehouseIds: z.array(idSchema).default([]),
  siteIds: z.array(idSchema).default([]),
  expenseCategoryIds: z.array(idSchema).default([]),
  cashregisterIds: z.array(idSchema).default([]),
  cashregisterAccountIds: z.array(idSchema).default([]),
  deliveryServiceIds: z.array(idSchema).default([]),
  orderSourceIds: z.array(idSchema).default([]),
  orderStatusIds: z.array(idSchema).default([]),
})

export type UserAccessScopesDTO = z.output<typeof userAccessScopesSchema>

export const userAccessSchema = userAccessScopesSchema.extend({
  id: idSchema,
  userId: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserAccessDTO = z.output<typeof userAccessSchema>
