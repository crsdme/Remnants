import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface Language {
  name: string
  code: string
  priority: number
  main: boolean
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getLanguagesResult {
  status: Status
  code: Code
  message: Message
  languages: Language[]
  languagesCount: number
}

export interface getLanguagesFilters {
  name: string
  code: string
  active: boolean[]
  priority: number
  main: boolean[]
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getLanguagesSorters {
  name: Sorter
  code: Sorter
  priority: Sorter
  main: Sorter
  active: Sorter
  createdAt: Sorter
  updatedAt: Sorter
}

export interface getLanguagesParams {
  filters: Partial<getLanguagesFilters>
  sorters: Partial<getLanguagesSorters>
  pagination: Partial<Pagination>
}

export interface createLanguagesResult {
  status: Status
  code: Code
  message: Message
  language: Language
}

export interface createLanguageParams {
  name: string
  code: string
  priority?: number
  main?: boolean
  active?: boolean
}

export interface editLanguagesResult {
  status: Status
  code: Code
  message: Message
  language: Language
}

export interface editLanguageParams {
  id: IdType
  name: string
  code: string
  priority?: number
  main?: boolean
  active?: boolean
}

export interface removeLanguagesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeLanguageParams {
  ids: IdType[]
}

export interface batchLanguagesResult {
  status: Status
  code: Code
  message: Message
}

export interface batchLanguagesParams {
  ids: IdType[]
  filters: Partial<getLanguagesFilters>
  params: {
    column: string
    value: string | number | boolean | LanguageString
  }[]
}

export interface importLanguagesResult {
  status: Status
  code: Code
  message: Message
  languageIds: IdType[]
}

export interface importLanguagesParams {
  file: Express.Multer.File
}

export interface duplicateLanguageResult {
  status: Status
  code: Code
  message: Message
}

export interface duplicateLanguageParams {
  ids: IdType[]
}
