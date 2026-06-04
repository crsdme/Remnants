import type {
  UserDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  createUserSchema,
  editUserSchema,
  getUserSchema,
  removeUserSchema,
} from '@remnant/shared'

export interface UserDB {
  _id: string
  seq: number
  login: string
  password: string
  name: string
  role: string
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

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
export interface GetUsersRepoResult { items: UserDTO[], total: number, page: number, pageSize: number }

export type CreateUsersRepoPayload = CreateUsersPayload

export type EditUsersRepoPayload = EditUsersPayload
