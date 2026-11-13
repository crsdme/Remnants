import type {
  AuthUser,
  CreateSettingResponse,
  EditSettingResponse,
  GetSettingsResponse,
  RemoveSettingResponse,
} from '@remnant/shared'
import type {
  CreateSettingRepoPayload,
  EditSettingRepoPayload,
  GetSettingsRepoPayload,
} from '@/types/'
import { mapSettingToDTO } from '@/mappers/'
import * as SettingRepo from '@/repositories/setting.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import { HttpError } from '@/utils/'

function toSettingValue(value: unknown): string {
  if (value == null)
    return ''
  if (typeof value === 'string')
    return value
  if (typeof value === 'boolean' || typeof value === 'number')
    return String(value)
  return JSON.stringify(value)
}

export async function get({ payload }: { payload: GetSettingsRepoPayload }): Promise<GetSettingsResponse> {
  const { items, total, page, pageSize } = await SettingRepo.list(payload)

  return {
    status: 'success',
    code: 'SETTINGS_FETCHED',
    message: 'Settings fetched',
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

export async function create({ payload, user }: { payload: CreateSettingRepoPayload, user?: AuthUser }): Promise<CreateSettingResponse> {
  const setting = await SettingRepo.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'setting',
    resourceId: setting._id.toString(),
    action: 'create',
    before: null,
    after: setting,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'SETTING_CREATED',
    message: 'Setting created',
    data: mapSettingToDTO(setting),
  }
}

export async function edit({ payload, user }: { payload: EditSettingRepoPayload, user?: AuthUser }): Promise<EditSettingResponse> {
  const nextValue = toSettingValue(payload.value)
  const existing = payload.id != null && payload.id !== ''
    ? await SettingRepo.findById(payload.id)
    : await SettingRepo.findByKey(payload.key)

  const setting = existing
    ? await SettingRepo.updateById(String(existing._id), {
        key: payload.key,
        value: nextValue,
        ...(payload.isPublic !== undefined ? { isPublic: payload.isPublic } : {}),
        ...(payload.scope !== undefined ? { scope: payload.scope } : {}),
      })
    : await SettingRepo.createOne({
        key: payload.key,
        value: nextValue,
        scope: payload.scope ?? 'delivery',
        isPublic: payload.isPublic ?? true,
        description: payload.key,
      })

  if (!setting)
    throw new HttpError(400, 'Setting not edited', 'SETTING_NOT_EDITED')

  await AuditLogsService.record({
    resourceType: 'setting',
    resourceId: setting._id.toString(),
    action: existing ? 'edit' : 'create',
    before: existing,
    after: setting,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'SETTING_EDITED',
    message: 'Setting edited',
    data: mapSettingToDTO(setting),
  }
}

export async function remove({ id, user }: { id: string, user?: AuthUser }): Promise<RemoveSettingResponse> {
  const setting = await SettingRepo.removeById(id)

  if (setting) {
    await AuditLogsService.record({
      resourceType: 'setting',
      resourceId: id,
      action: 'remove',
      before: setting,
      after: null,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'SETTINGS_REMOVED',
    message: 'Settings removed',
  }
}
