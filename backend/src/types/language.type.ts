import type {
  LanguageDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { languageDBSchema } from '../schemas'
import {
  createLanguageSchema,
  editLanguageSchema,
  getLanguageSchema,
  removeLanguageSchema,
} from '@remnant/shared'

export type LanguageDB = z.infer<typeof languageDBSchema>

export type GetLanguagesPayload = z.output<typeof getLanguageSchema>
export function parseGetLanguages(x: unknown): GetLanguagesPayload {
  return getLanguageSchema.parse(x)
}

export type CreateLanguagePayload = z.output<typeof createLanguageSchema>
export function parseCreateLanguage(x: unknown): CreateLanguagePayload {
  return createLanguageSchema.parse(x)
}

export type EditLanguagePayload = z.output<typeof editLanguageSchema>
export function parseEditLanguage(x: unknown): EditLanguagePayload {
  return editLanguageSchema.parse(x)
}

export type RemoveLanguagesPayload = z.output<typeof removeLanguageSchema>
export function parseRemoveLanguages(x: unknown): RemoveLanguagesPayload {
  return removeLanguageSchema.parse(x)
}

export type GetLanguagesRepoPayload = GetLanguagesPayload
export interface GetLanguagesRepoResult { items: LanguageDTO[], total: number, page: number, pageSize: number }

export type CreateLanguagesRepoPayload = CreateLanguagePayload

export type EditLanguagesRepoPayload = EditLanguagePayload
