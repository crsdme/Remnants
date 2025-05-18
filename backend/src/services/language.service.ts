import type * as LanguageTypes from '../types/language.type'
import { LanguageModel } from '../models/'
import { HttpError } from '../utils/httpError'
import { parseFile, toBoolean, toNumber } from '../utils/parseTools'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: LanguageTypes.getLanguagesParams): Promise<LanguageTypes.getLanguagesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination

  const {
    name = '',
    code = '',
    active = undefined,
    priority = undefined,
    main = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters

  const sorters = buildSortQuery(payload.sorters)

  const filterRules = {
    name: { type: 'string' },
    code: { type: 'string' },
    active: { type: 'array' },
    priority: { type: 'exact' },
    main: { type: 'array' },
  } as const

  const query = buildQuery({
    filters: { name, code, active, priority, main, createdAt, updatedAt },
    rules: filterRules,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $facet: {
        languages: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const languagesRaw = await LanguageModel.aggregate(pipeline).exec()

  const languages = languagesRaw[0].languages.map((doc: any) => LanguageModel.hydrate(doc))
  const languagesCount = languagesRaw[0].totalCount[0]?.count || 0

  return {
    status: 'success',
    code: 'LANGUAGES_FETCHED',
    message: 'Languages fetched successfully',
    languages,
    languagesCount,
  }
}

export async function create(payload: LanguageTypes.createLanguageParams): Promise<LanguageTypes.createLanguagesResult> {
  const language = await LanguageModel.create(payload)

  return {
    status: 'success',
    code: 'LANGUAGE_CREATED',
    message: 'Language created successfully',
    language,
  }
}

export async function edit(payload: LanguageTypes.editLanguageParams): Promise<LanguageTypes.editLanguagesResult> {
  const { id } = payload

  const language = await LanguageModel.findOneAndUpdate({ _id: id }, payload)

  if (!language) {
    throw new HttpError(400, 'Language not edited', 'LANGUAGE_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'LANGUAGE_EDITED',
    message: 'Language edited successfully',
    language,
  }
}

export async function remove(payload: LanguageTypes.removeLanguageParams): Promise<LanguageTypes.removeLanguagesResult> {
  const { ids } = payload

  const languages = await LanguageModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!languages) {
    throw new HttpError(400, 'Language not removed', 'LANGUAGE_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'LANGUAGES_REMOVED',
    message: 'Languages removed successfully',
  }
}

export async function batch(payload: LanguageTypes.batchLanguagesParams): Promise<LanguageTypes.batchLanguagesResult> {
  const { ids, filters, params } = payload

  const {
    name = '',
    code = '',
    active = undefined,
    priority = undefined,
    main = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = filters || {}

  const allowedParams = ['name', 'code', 'priority', 'main', 'active']

  const batchParams = params
    .filter(item => item.column && item.value && allowedParams.includes(item.column))
    .map(item => ({ [`${item.column}`]: item.value }))

  const mergedBatchParams = Object.assign({}, ...batchParams)

  const filterRules = {
    name: { type: 'string' },
    code: { type: 'string' },
    active: { type: 'array' },
    priority: { type: 'exact' },
    main: { type: 'array' },
  } as const

  const query = buildQuery({
    filters: { name, code, active, priority, main, createdAt, updatedAt },
    rules: filterRules,
    batch: { ids: ids.map(id => id.toString()) },
  })

  const languages = await LanguageModel.updateMany(
    query,
    { $set: mergedBatchParams },
  )

  if (!languages) {
    throw new HttpError(400, 'Language not batch edited', 'LANGUAGE_NOT_BATCH_EDITED')
  }

  return {
    status: 'success',
    code: 'LANGUAGES_BATCH_EDITED',
    message: 'Languages batch edited successfully',
  }
}

export async function upload(payload: LanguageTypes.importLanguagesParams): Promise<LanguageTypes.importLanguagesResult> {
  const { file } = payload

  const storedFile = await parseFile(file.path)

  const parsedLanguages = storedFile.map(row => ({
    name: row.name,
    code: row.code,
    priority: toNumber(row.priority),
    active: toBoolean(row.active),
    main: toBoolean(row.main),
  }))

  const languages = await LanguageModel.create(parsedLanguages)

  const languageIds = languages.map(language => language._id)

  return {
    status: 'success',
    code: 'LANGUAGES_IMPORTED',
    message: 'Languages imported successfully',
    languageIds,
  }
}

export async function duplicate(payload: LanguageTypes.duplicateLanguageParams): Promise<LanguageTypes.duplicateLanguageResult> {
  const { ids } = payload

  const languages = await LanguageModel.find({ _id: { $in: ids } })

  const parsedLanguages = languages.map(language => ({
    name: language.name,
    code: language.code,
    priority: language.priority,
    active: language.active,
    main: language.main,
  }))

  await LanguageModel.create(parsedLanguages)

  return {
    status: 'success',
    code: 'LANGUAGES_DUPLICATED',
    message: 'Languages duplicated successfully',
  }
}
