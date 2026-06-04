import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface SiteDTO {
  id: IdType
  names: LanguageString
  url: string
  key: string
  priority: number
  active: boolean
  warehouses: IdType[]
  createdAt: Date
  updatedAt: Date
}

export type GetSitesResponse = ResponseList<SiteDTO>

export type CreateSiteResponse = ResponseItem<SiteDTO>

export type EditSiteResponse = ResponseItem<SiteDTO>

export type RemoveSitesResponse = Response
