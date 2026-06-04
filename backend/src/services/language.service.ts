import type {
  CreateLanguageResponse,
  EditLanguageResponse,
  GetLanguagesResponse,
  RemoveLanguagesResponse,
} from '@remnant/shared'
import type { CreateLanguagePayload, EditLanguagePayload, GetLanguagesPayload, RemoveLanguagesPayload } from '@/types'
import { mapLanguageToDTO } from '@/mappers/'
import * as LanguageRepo from '@/repositories/language.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetLanguagesPayload }): Promise<GetLanguagesResponse> {
  const { items, total, page, pageSize } = await LanguageRepo.list(payload)

  return {
    status: 'success',
    code: 'LANGUAGES_FETCHED',
    message: 'Languages fetched successfully',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload }: { payload: CreateLanguagePayload }): Promise<CreateLanguageResponse> {
  const language = await LanguageRepo.createOne(payload)

  return {
    status: 'success',
    code: 'LANGUAGE_CREATED',
    message: 'Language created successfully',
    data: mapLanguageToDTO(language),
  }
}

export async function edit({ payload }: { payload: EditLanguagePayload }): Promise<EditLanguageResponse> {
  const { id } = payload

  const language = await LanguageRepo.updateById(id, payload)

  if (!language) {
    throw new HttpError(400, 'Language not edited', 'LANGUAGE_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'LANGUAGE_EDITED',
    message: 'Language edited successfully',
    data: mapLanguageToDTO(language),
  }
}

export async function remove({ payload }: { payload: RemoveLanguagesPayload }): Promise<RemoveLanguagesResponse> {
  for (const id of payload.ids) {
    await LanguageRepo.removeById(id)
  }

  return {
    status: 'success',
    code: 'LANGUAGES_REMOVED',
    message: 'Languages removed successfully',
  }
}
