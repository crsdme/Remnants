import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface Unit {
  id: IdType
  names: LanguageString
  symbols: LanguageString
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getUnitsResult {
  status: Status
  code: Code
  message: Message
  units: Unit[]
  unitsCount: number
}

export interface getUnitsFilters {
  names: string
  symbols: string
  language: SUPPORTED_LANGUAGES_TYPE
  active: boolean[]
  priority: number
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getUnitsSorters {
  names: Sorter
  symbols: Sorter
  active: Sorter
  priority: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getUnitsParams {
  filters?: Partial<getUnitsFilters>
  sorters?: Partial<getUnitsSorters>
  pagination?: Partial<Pagination>
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
  id: IdType
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

export interface removeUnitsParams {
  ids: IdType[]
}

export interface batchUnitsResult {
  status: Status
  code: Code
  message: Message
}

export interface batchUnitsParams {
  ids: IdType[]
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
  unitIds: any[]
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
  ids: IdType[]
}
