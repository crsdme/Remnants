import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Unit } from '../models/unit.model'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Status } from './common.type'

export interface getUnitsResult {
  status: Status
  code: Code
  message: Message
  units: Unit[]
  unitsCount: number
}

export interface getUnitsParams {
  filters: {
    names: LanguageString
    symbols: LanguageString
    language: SUPPORTED_LANGUAGES_TYPE
    active: boolean[]
    priority: number
    createdAt: DateRange
    updatedAt: DateRange
  }
  sorters: {
    names: string
    symbols: string
    active: string
    priority: string
    updatedAt: string
    createdAt: string
  }
  pagination: Pagination
}

export interface createUnitsResult {
  status: Status
  code: Code
  message: Message
  unit: Unit
}

export interface createUnitParams {
  names: LanguageString
  symbols: LanguageString
  priority: number
  active?: boolean
}

export interface editUnitResult {
  status: Status
  code: Code
  message: Message
  unit: Unit
}

export interface editUnitParams {
  _id: IdType
  names: LanguageString
  symbols: LanguageString
  priority: number
  active?: boolean
}

export interface removeUnitsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeUnitParams {
  _ids: IdType[]
}

export interface batchUnitsResult {
  status: Status
  code: Code
  message: Message
}

export interface batchUnitsParams {
  _ids: IdType[]
  filters: {
    names: LanguageString
    symbols: LanguageString
    language: SUPPORTED_LANGUAGES_TYPE
    active: boolean[]
    priority: number
    createdAt: DateRange
    updatedAt: DateRange
  }
  params: {
    column: string
    value: string | number | boolean | Record<string, string>
  }[]
}

export interface importUnitsResult {
  status: Status
  code: Code
  message: Message
}

export interface importUnitsParams {
  file: Express.Multer.File
}

export interface duplicateUnitResult {
  status: Status
  code: Code
  message: Message
}

export interface duplicateUnitParams {
  _ids: IdType[]
}
