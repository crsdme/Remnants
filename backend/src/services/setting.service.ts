import type {
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
import { HttpError } from '@/utils/'

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

export async function create({ payload }: { payload: CreateSettingRepoPayload }): Promise<CreateSettingResponse> {
  const setting = await SettingRepo.createOne(payload)

  return {
    status: 'success',
    code: 'SETTING_CREATED',
    message: 'Setting created',
    data: mapSettingToDTO(setting),
  }
}

export async function edit({ payload }: { payload: EditSettingRepoPayload }): Promise<EditSettingResponse> {
  const setting = await SettingRepo.updateById(payload.id, payload)

  if (!setting)
    throw new HttpError(400, 'Setting not edited', 'SETTING_NOT_EDITED')

  return {
    status: 'success',
    code: 'SETTING_EDITED',
    message: 'Setting edited',
    data: mapSettingToDTO(setting),
  }
}

export async function remove({ id }: { id: string }): Promise<RemoveSettingResponse> {
  await SettingRepo.removeById(id)

  return {
    status: 'success',
    code: 'SETTINGS_REMOVED',
    message: 'Settings removed',
  }
}
