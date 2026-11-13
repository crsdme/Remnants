import type {
  AuthUser,
  CreateLanguageResponse,
  EditLanguageResponse,
  GetLanguageResponse,
  RemoveLanguageResponse,
} from '@remnant/shared'
import type { CreateLanguagePayload, EditLanguagePayload, GetLanguagesPayload, RemoveLanguagesPayload } from '@/types'
import { mapLanguageToDTO } from '@/mappers/'
import { LanguageModel } from '@/models'
import * as LanguageRepo from '@/repositories/language.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetLanguagesPayload }): Promise<GetLanguageResponse> {
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

export async function create({ payload, user }: { payload: CreateLanguagePayload, user?: AuthUser }): Promise<CreateLanguageResponse> {
  const language = await LanguageRepo.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'language',
    resourceId: language._id.toString(),
    action: 'create',
    before: null,
    after: language,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'LANGUAGE_CREATED',
    message: 'Language created successfully',
    data: mapLanguageToDTO(language),
  }
}

export async function edit({ payload, user }: { payload: EditLanguagePayload, user?: AuthUser }): Promise<EditLanguageResponse> {
  const { id } = payload

  const before = await LanguageModel.findById(id).exec()
  const language = await LanguageRepo.updateById(id, payload)

  if (!language) {
    throw new HttpError(400, 'Language not edited', 'LANGUAGE_NOT_EDITED')
  }

  await AuditLogsService.record({
    resourceType: 'language',
    resourceId: language._id.toString(),
    action: 'edit',
    before,
    after: language,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'LANGUAGE_EDITED',
    message: 'Language edited successfully',
    data: mapLanguageToDTO(language),
  }
}

export async function remove({ payload, user }: { payload: RemoveLanguagesPayload, user?: AuthUser }): Promise<RemoveLanguageResponse> {
  for (const id of payload.ids) {
    const language = await LanguageRepo.removeById(id)

    if (!language)
      continue

    await AuditLogsService.record({
      resourceType: 'language',
      resourceId: id,
      action: 'remove',
      before: language,
      after: null,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'LANGUAGES_REMOVED',
    message: 'Languages removed successfully',
  }
}
