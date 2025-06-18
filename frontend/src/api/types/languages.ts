export interface getLanguagesParams {
  filters?: {
    name?: string
    code?: string
    active?: boolean[]
    main?: boolean[]
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
    updatedAt?: {
      from?: Date
      to?: Date
    }
  }
  sorters?: {
    name?: number
    code?: number
    main?: number
    priority?: number
    active?: number
    createdAt?: number
    updatedAt?: number
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createLanguagesParams {
  name: string
  code: string
  main?: boolean
  priority: number
  active?: boolean
}

export interface editLanguageParams {
  id: string
  name: string
  code: string
  main?: boolean
  priority: number
  active?: boolean
}

export interface removeLanguageParams {
  ids: string[]
}

interface batchItem {
  id: string
  column: string
  value: string | number | boolean | Record<string, string>
}

interface batchFilterItem {
  filters?: {
    name?: string
    code?: string
    active?: boolean[]
    main?: boolean[]
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
    updatedAt?: {
      from?: Date
      to?: Date
    }
  }
}

export interface batchLanguageParams {
  ids: string[]
  params: batchItem[]
  filters: batchFilterItem[]
}

export interface importLanguagesParams {
  file: File
}

export interface duplicateLanguageParams {
  ids: string[]
}

export interface LanguagesResponse {
  status: string
  code: string
  message: string
  description: string
  languages: Language[]
  languagesCount: number
}
