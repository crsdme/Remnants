export interface getSitesParams {
  filters?: {
    names?: string
    url?: string
    key?: string
    priority?: number
    ids?: string[]
  }
  sorters?: {
    priority?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createSitesParams {
  names: LanguageString
  url: string
  key: string
  priority?: number
}

export interface SitesResponse {
  status: string
  code: string
  message: string
  description: string
  sites: Site[]
  sitesCount: number
}

export interface editSitesParams {
  id: string
  names: LanguageString
  url: string
  key: string
  priority?: number
}

export interface removeSitesParams {
  ids: string[]
}
