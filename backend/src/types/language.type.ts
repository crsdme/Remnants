import type { Language } from '../models/language.model'
import type { DateRange, IdType, Message, Pagination, Status } from './common.type'

export interface getLanguagesResult {
  status: Status
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
    name: number
    code: number
    priority: number
    main: number
    active: number
    createdAt: number
    updatedAt: number
  }
  pagination: Pagination
}

export interface createLanguagesResult {
  status: Status
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
  message: Message
}

export interface removeLanguageParams {
  _ids: IdType[]
}

export interface batchLanguagesResult {
  status: Status
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
  message: Message
}

export interface importLanguagesParams {
  file: Express.Multer.File
}

export interface duplicateLanguageResult {
  status: Status
  message: Message
}

export interface duplicateLanguageParams {
  _ids: IdType[]
}
