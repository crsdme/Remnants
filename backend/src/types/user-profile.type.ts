import type { z } from 'zod'
import type { userProfileDBSchema } from '../schemas'
import {
  editUserProfileSchema,
  getUserProfileSchema,
  getUserProfilesSchema,
  getUserProfileSummarySchema,
} from '@remnant/shared'

export type UserProfileDB = z.infer<typeof userProfileDBSchema>

export type GetUserProfilesPayload = z.output<typeof getUserProfilesSchema>
export function parseGetUserProfiles(x: unknown): GetUserProfilesPayload {
  return getUserProfilesSchema.parse(x)
}

export type GetUserProfilePayload = z.output<typeof getUserProfileSchema>
export function parseGetUserProfile(x: unknown): GetUserProfilePayload {
  return getUserProfileSchema.parse(x)
}

export type EditUserProfilePayload = z.output<typeof editUserProfileSchema>
export function parseEditUserProfile(x: unknown): EditUserProfilePayload {
  return editUserProfileSchema.parse(x)
}

export type GetUserProfileSummaryPayload = z.output<typeof getUserProfileSummarySchema>
export function parseGetUserProfileSummary(x: unknown): GetUserProfileSummaryPayload {
  return getUserProfileSummarySchema.parse(x)
}
