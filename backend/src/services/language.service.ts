import type * as LanguageTypes from '../types/language.type'
import { LanguageModel } from '../models/'
import { HttpError } from '../utils/httpError'
import { parseFile, toBoolean, toNumber } from '../utils/parseTools'

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

  const sorters = payload.sorters

  let query: Record<string, any> = { removed: false }

  let sortersQuery: Record<string, any> = { _id: 1 }

  if (Object.entries(sorters).length > 0) {
    sortersQuery = Object.fromEntries(
      Object.entries(sorters).map(([key, value]) => [
        key,
        value === 'asc' ? 1 : -1,
      ]),
    )
  }

  if (name.trim()) {
    query = {
      ...query,
      name: { $regex: `^${name}`, $options: 'i' },
    }
  }

  if (code.trim()) {
    query = {
      ...query,
      code: { $regex: `^${code}`, $options: 'i' },
    }
  }

  if (Array.isArray(active) && active.length > 0) {
    query = {
      ...query,
      active: { $in: active },
    }
  }

  if (Array.isArray(main) && main.length > 0) {
    query = {
      ...query,
      main: { $in: main },
    }
  }

  if (priority) {
    query = {
      ...query,
      priority,
    }
  }

  if (createdAt.from && createdAt.to) {
    query = {
      ...query,
      createdAt: { $gte: createdAt.from, $lte: createdAt.to },
    }
  }

  if (updatedAt.from && updatedAt.to) {
    query = {
      ...query,
      updatedAt: { $gte: updatedAt.from, $lte: updatedAt.to },
    }
  }
  console.log(sortersQuery)
  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sortersQuery,
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

  const languagesResult = await LanguageModel.aggregate(pipeline).exec()

  const languages = languagesResult[0].languages
  const languagesCount = languagesResult[0].totalCount[0]?.count || 0

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
  const { _id } = payload

  const language = await LanguageModel.findOneAndUpdate({ _id }, payload)

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
  const { _ids } = payload

  const languages = await LanguageModel.updateMany(
    { _id: { $in: _ids } },
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
  const { _ids, filters, params } = payload

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

  const filteredParams = params.filter(item => item.column && item.value && allowedParams.includes(item.column))

  const batchParams = filteredParams.map(item => ({ [`${item.column}`]: item.value }))

  const mergedBatchParams = Object.assign({}, ...batchParams)

  let query: Record<string, any> = { removed: false }

  if (name) {
    query = {
      ...query,
      name,
    }
  }

  if (code) {
    query = {
      ...query,
      code,
    }
  }

  if (Array.isArray(active) && active.length > 0) {
    query = {
      ...query,
      active: { $in: active },
    }
  }

  if (Array.isArray(main) && main.length > 0) {
    query = {
      ...query,
      main: { $in: main },
    }
  }

  if (priority) {
    query = {
      ...query,
      priority,
    }
  }

  if (createdAt.from && createdAt.to) {
    query = {
      ...query,
      createdAt: { $gte: createdAt.from, $lte: createdAt.to },
    }
  }

  if (updatedAt.from && updatedAt.to) {
    query = {
      ...query,
      updatedAt: { $gte: updatedAt.from, $lte: updatedAt.to },
    }
  }

  if (filters) {
    query = {
      $or: [query, { _id: { $in: _ids } }],
    }
  }
  else {
    query = {
      _id: { $in: _ids },
    }
  }

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

  await LanguageModel.insertMany(parsedLanguages)

  return {
    status: 'success',
    code: 'LANGUAGES_IMPORTED',
    message: 'Languages imported successfully',
  }
}

export async function duplicate(payload: LanguageTypes.duplicateLanguageParams): Promise<LanguageTypes.duplicateLanguageResult> {
  const { _ids } = payload

  const languages = await LanguageModel.find({ _id: { $in: _ids } })

  const parsedLanguages = languages.map(language => ({
    name: language.name,
    code: language.code,
    priority: language.priority,
    active: language.active,
    main: language.main,
  }))

  await LanguageModel.insertMany(parsedLanguages)

  return {
    status: 'success',
    code: 'LANGUAGES_DUPLICATED',
    message: 'Languages duplicated successfully',
  }
}
