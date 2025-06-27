import type * as SettingTypes from '../types/setting.type'
import { SettingModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery } from '../utils/queryBuilder'

export async function get(payload: SettingTypes.getSettingsParams): Promise<SettingTypes.getSettingsResult> {
  const {
    key = '',
    scope = '',
    isPublic = true,
  } = payload.filters || {}

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

  return { status: 'success', code: 'SETTINGS_FETCHED', message: 'Settings fetched', settings, settingsCount }
}

export async function create(payload: SettingTypes.createSettingParams): Promise<SettingTypes.createSettingResult> {
  const setting = await SettingModel.create(payload)

  return { status: 'success', code: 'SETTING_CREATED', message: 'Setting created', setting }
}

export async function edit(payload: SettingTypes.editSettingParams): Promise<SettingTypes.editSettingResult> {
  const { key } = payload

  const setting = await SettingModel.findOneAndUpdate({ key }, { $set: payload })

  if (!setting) {
    throw new HttpError(400, 'Setting not edited', 'SETTING_NOT_EDITED')
  }

  return { status: 'success', code: 'SETTING_EDITED', message: 'Setting edited', setting }
}

export async function remove(): Promise<SettingTypes.removeSettingsResult> {
  await SettingModel.deleteMany({})

  return { status: 'success', code: 'SETTINGS_REMOVED', message: 'Settings removed' }
}
