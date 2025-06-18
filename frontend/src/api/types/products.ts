export interface getProductsParams {
  filters: {
    seq?: number
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
    seq?: string
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

export interface createProductsParams extends FormData {}

export interface editProductParams extends FormData {}

export interface removeProductParams {
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

export interface batchProductParams {
  ids: string[]
  params: batchItem[]
  filters: batchFilterItem[]
}

export interface importProductsParams {
  file: File
}

export interface duplicateProductParams {
  ids: string[]
}

export interface exportProductsParams {
  ids: string[]
}

export interface ProductsResponse {
  status: string
  code: string
  message: string
  description: string
  products: Product[]
  productsCount: number
}
