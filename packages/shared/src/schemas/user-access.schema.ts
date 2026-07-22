import { z } from 'zod'
import { idSchema } from './common'

export const USER_ACCESS_SCOPE_KEYS = [
  'warehouses',
  'sites',
  'expenseCategories',
  'cashregisters',
  'cashregisterAccounts',
  'deliveryServices',
  'orderSources',
  'orderStatuses',
] as const

export type UserAccessScopeKey = (typeof USER_ACCESS_SCOPE_KEYS)[number]

export const emptyUserAccessScopes = {
  warehouses: [] as string[],
  sites: [] as string[],
  expenseCategories: [] as string[],
  cashregisters: [] as string[],
  cashregisterAccounts: [] as string[],
  deliveryServices: [] as string[],
  orderSources: [] as string[],
  orderStatuses: [] as string[],
}

export const userAccessScopesSchema = z.object({
  warehouses: z.array(idSchema).default([]),
  sites: z.array(idSchema).default([]),
  expenseCategories: z.array(idSchema).default([]),
  cashregisters: z.array(idSchema).default([]),
  cashregisterAccounts: z.array(idSchema).default([]),
  deliveryServices: z.array(idSchema).default([]),
  orderSources: z.array(idSchema).default([]),
  orderStatuses: z.array(idSchema).default([]),
})

export type UserAccessScopesDTO = z.output<typeof userAccessScopesSchema>

export const userAccessSchema = userAccessScopesSchema.extend({
  id: idSchema,
  userId: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserAccessDTO = z.output<typeof userAccessSchema>
