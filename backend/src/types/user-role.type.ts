import type {
  LanguageString,
  UserRoleDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  createUserRoleSchema,
  editUserRoleSchema,
  getUserRoleSchema,
  removeUserRoleSchema,
} from '@remnant/shared'

export interface UserRoleDB {
  _id: string
  seq: number
  names: LanguageString
  permissions: string[]
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetUserRolesPayload = z.output<typeof getUserRoleSchema>
export function parseGetUserRoles(x: unknown): GetUserRolesPayload {
  return getUserRoleSchema.parse(x)
}

export type CreateUserRolesPayload = z.output<typeof createUserRoleSchema>
export function parseCreateUserRoles(x: unknown): CreateUserRolesPayload {
  return createUserRoleSchema.parse(x)
}

export type EditUserRolesPayload = z.output<typeof editUserRoleSchema>
export function parseEditUserRoles(x: unknown): EditUserRolesPayload {
  return editUserRoleSchema.parse(x)
}

export type RemoveUserRolesPayload = z.output<typeof removeUserRoleSchema>
export function parseRemoveUserRoles(x: unknown): RemoveUserRolesPayload {
  return removeUserRoleSchema.parse(x)
}

export type GetUserRolesRepoPayload = GetUserRolesPayload
export interface GetUserRolesRepoResult { items: UserRoleDTO[], total: number, page: number, pageSize: number }

export type CreateUserRolesRepoPayload = CreateUserRolesPayload

export type EditUserRolesRepoPayload = EditUserRolesPayload
