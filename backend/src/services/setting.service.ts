import type {
  CreateSettingParams,
  CreateSettingResponse,
  EditSettingParams,
  EditSettingResponse,
  GetSettingsParams,
  GetSettingsResponse,
  RemoveSettingsResponse,
} from '@remnant/shared'
import { SettingModel } from '@/models/'
import { buildQuery, HttpError } from '@/utils/'

export async function get(payload: GetSettingsParams): Promise<GetSettingsResponse> {
  const {
    key = '',
    scope = '',
    isPublic = true,
  } = payload.filters || {}

  const {
    current = 1,
    pageSize = 10,
  } = payload.pagination || {}

  const filterRules = {
    key: { type: 'string' },
    scope: { type: 'string' },
    isPublic: { type: 'exact' },
  } as const

  const query = buildQuery({
    filters: { key, scope, isPublic },
    rules: filterRules,
    removed: false,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $facet: {
        settings: [],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const settingsRaw = await SettingModel.aggregate(pipeline).exec()

  const settings = settingsRaw[0].settings.map((doc: any) => SettingModel.hydrate(doc))
  const settingsCount = settingsRaw[0].totalCount[0]?.count || 0

  return {
    status: 'success',
    code: 'SETTINGS_FETCHED',
    message: 'Settings fetched',
    data: {
      items: settings,
      pagination: {
        page: current,
        pageSize,
        total: settingsCount,
      },
    },
  }
}

export async function create(payload: CreateSettingParams): Promise<CreateSettingResponse> {
  const setting = await SettingModel.create(payload)

  return {
    status: 'success',
    code: 'SETTING_CREATED',
    message: 'Setting created',
    data: setting,
  }
}

export async function edit(payload: EditSettingParams): Promise<EditSettingResponse> {
  const { key } = payload

  const setting = await SettingModel.findOneAndUpdate({ key }, { $set: payload })

  if (!setting) {
    throw new HttpError(400, 'Setting not edited', 'SETTING_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'SETTING_EDITED',
    message: 'Setting edited',
    data: setting,
  }
}

export async function remove(): Promise<RemoveSettingsResponse> {
  await SettingModel.deleteMany({})

  return {
    status: 'success',
    code: 'SETTINGS_REMOVED',
    message: 'Settings removed',
  }
}
