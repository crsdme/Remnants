import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface Site {
  id: IdType
  names: LanguageString
  url: string
  key: string
  priority: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getSitesResult {
  status: Status
  code: Code
  message: Message
  sites: Site[]
  sitesCount: number
}

export interface getSitesFilters {
  names: string
  url: string
  key: string
  priority: number
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getSitesSorters {
  names: Sorter
  priority: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getSitesParams {
  filters?: Partial<getSitesFilters>
  sorters?: Partial<getSitesSorters>
  pagination?: Partial<Pagination>
}

export interface createSiteResult {
  status: Status
  code: Code
  message: Message
  site: Site
}

export interface createSiteParams {
  names: LanguageString
  url: string
  key: string
  priority?: number
  active?: boolean
}

export interface editSiteResult {
  status: Status
  code: Code
  message: Message
  site: Site
}

export interface editSiteParams {
  id: IdType
  names: LanguageString
  url: string
  key: string
  priority?: number
  active?: boolean
}

export interface removeSitesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeSitesParams {
  ids: IdType[]
}
