import { LanguageModel } from '../models/'

interface getLanguagesResult {
  languages: any[]
  languagesCount: number
}

interface getLanguagesParams {
  filters: any[]
  sorters: any[]
  pagination: {
    current: number
    pageSize: number
  }
}

export async function get(payload: getLanguagesParams): Promise<getLanguagesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination

  const query = { removed: false }

  const pipeline = [
    {
      $match: query,
    },
  ]

  const languagesCount = await LanguageModel.countDocuments(query)

  const languagesQuery = LanguageModel.aggregate(pipeline)

  languagesQuery
    .skip((current - 1) * pageSize)
    .limit(pageSize)

  const languages = await languagesQuery.exec()

  if (!languages) {
    throw new Error('Products not found')
  }

  return { languages, languagesCount }
}

interface createLanguagesResult {
  language: any
}

interface createLanguageParams {
  name: string
  code: string
  main?: boolean
  active?: boolean
}

export async function create(payload: createLanguageParams): Promise<createLanguagesResult> {
  const language = await LanguageModel.create(payload)

  if (!language) {
    throw new Error('Language not created')
  }

  return { language }
}

interface editLanguagesResult {
  language: any
}

interface editLanguageParams {
  _id: string
  name: string
  code: string
  main?: boolean
  active?: boolean
}

export async function edit(payload: editLanguageParams): Promise<editLanguagesResult> {
  const { _id } = payload

  if (!_id) {
    throw new Error('Need _ID')
  }

  const language = await LanguageModel.updateOne({ _id }, payload)

  if (!language) {
    throw new Error('Language not edited')
  }

  return { language }
}

interface editLanguagesResult {
  language: any
}

interface removeLanguageParams {
  _id: string
}

export async function remove(payload: removeLanguageParams): Promise<editLanguagesResult> {
  const { _id } = payload

  if (!_id) {
    throw new Error('Need _ID')
  }

  const language = await LanguageModel.updateOne(
    { _id },
    { $set: { removed: true } },
  )

  if (!language) {
    throw new Error('Language not removed')
  }

  return { language }
}
