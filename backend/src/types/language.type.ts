import type { Language } from '../models/language.model'
import type { Code, DateRange, IdType, Message, Pagination, Status } from './common.type'

export interface getLanguagesResult {
  status: Status
  code: Code
  message: Message
  languages: Language[]
  languagesCount: number
}

export interface getLanguagesParams {
  filters: {
    name: string
    code: string
    active: boolean[]
    priority: number
    main: boolean[]
    createdAt: DateRange
    updatedAt: DateRange
  }
  sorters: {
    name: string
    code: string
    priority: string
    main: string
    active: string
    createdAt: string
    updatedAt: string
  }
  pagination: Pagination
}

export interface createLanguagesResult {
  status: Status
  code: Code
  message: Message
  language: Language
}

export interface createLanguageParams {
  names: object
  code: string
  priority: number
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
  _id: IdType
  name: string
  code: string
  priority: number
  main?: boolean
  active?: boolean
}

export interface removeLanguagesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeLanguageParams {
  _ids: IdType[]
}

export interface batchLanguagesResult {
  status: Status
  code: Code
  message: Message
}

export interface batchLanguagesParams {
  _ids: IdType[]
  filters: {
    name: string
    code: string
    priority: number
    main: boolean
    active: boolean
    createdAt: DateRange
    updatedAt: DateRange
  }
  params: {
    column: string
    value: string | number | boolean | Record<string, string>
  }[]
}

export interface importLanguagesResult {
  status: Status
  code: Code
  message: Message
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
  _ids: IdType[]
}
