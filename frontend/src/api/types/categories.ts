export interface getCategoriesParams {
  filters: {
    names?: string
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
    names?: string
    priority?: string
    createdAt?: string
    updatedAt?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
  isTree?: boolean
}

export interface createCategoriesParams {
  names: LanguageString
  priority: number
  parent: string
  active?: boolean
}

export interface editCategoryParams {
  id: string
  names: LanguageString
  priority: number
  parent: string
  active?: boolean
}

export interface removeCategoryParams {
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

export interface batchCategoryParams {
  ids: string[]
  params: batchItem[]
  filters: batchFilterItem[]
}

export interface importCategoriesParams {
  file: File
}

export interface duplicateCategoryParams {
  ids: string[]
}

export interface exportCategoriesParams {
  ids: string[]
}

export interface CategoriesResponse {
  status: string
  code: string
  message: string
  description: string
  categories: Category[]
  categoriesCount: number
}
