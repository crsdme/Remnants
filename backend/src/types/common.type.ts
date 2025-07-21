import type { SUPPORTED_LANGUAGES } from '../config/constants'

export type LanguageString = Partial<{
  [key in (typeof SUPPORTED_LANGUAGES)[number]]: string
}>

export type Sorter = 'asc' | 'desc'

export type Status = 'success' | 'error'

export type Code = string

export type Message = string

export interface Pagination {
  current?: number
  pageSize?: number
  full?: boolean
}

export type IdType = string

export interface DateRange {
  from: Date
  to: Date
}
