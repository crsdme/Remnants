import type {
  UserPopulatedDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { userDBSchema, userPopulatedDBSchema } from '@/schemas/user.schema'
import {
  createUserSchema,
  editUserSchema,
  getUserSchema,
  removeUserSchema,
} from '@remnant/shared'

export type UserDB = z.infer<typeof userDBSchema>

export type UserPopulatedDB = z.infer<typeof userPopulatedDBSchema>

export type GetUsersPayload = z.output<typeof getUserSchema>
export function parseGetUsers(x: unknown): GetUsersPayload {
  return getUserSchema.parse(x)
}

export type CreateUsersPayload = z.output<typeof createUserSchema>
export function parseCreateUsers(x: unknown): CreateUsersPayload {
  return createUserSchema.parse(x)
}

export type EditUsersPayload = z.output<typeof editUserSchema>
export function parseEditUsers(x: unknown): EditUsersPayload {
  return editUserSchema.parse(x)
}

export type RemoveUsersPayload = z.output<typeof removeUserSchema>
export function parseRemoveUsers(x: unknown): RemoveUsersPayload {
  return removeUserSchema.parse(x)
}

export type GetUsersRepoPayload = GetUsersPayload
export interface GetUsersRepoResult { items: UserPopulatedDTO[], total: number, page: number, pageSize: number }

export type CreateUsersRepoPayload = CreateUsersPayload

export type EditUsersRepoPayload = EditUsersPayload
