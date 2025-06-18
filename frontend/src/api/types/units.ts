export interface getUnitsParams {
  filters: {
    names?: string
    symbols?: string
    language: string
    active?: boolean[]
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
    names?: number
    priority?: number
    createdAt?: number
    updatedAt?: number
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createUnitsParams {
  names: LanguageString
  symbols: LanguageString
  priority: number
  active?: boolean
}

export interface editUnitParams {
  id: string
  names: LanguageString
  symbols: LanguageString
  priority: number
  active?: boolean
}

export interface removeUnitParams {
  ids: string[]
}

interface batchItem {
  id: string
  column: string
  value: string | number | boolean | Record<string, string>
}

interface batchFilterItem {
  filters?: {
    names?: string
    symbols?: string
    language: string
    active?: boolean[]
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
  }
}

export interface batchUnitParams {
  ids: string[]
  params: batchItem[]
  filters: batchFilterItem[]
}

export interface importUnitsParams {
  file: File
}

export interface duplicateUnitParams {
  ids: string[]
}

export interface UnitsResponse {
  status: string
  code: string
  message: string
  description: string
  units: Unit[]
  unitsCount: number
}
