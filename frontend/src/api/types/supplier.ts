export interface getSuppliersParams {
  filters?: {
    ids?: string[]
    name?: string
    emails?: string[]
    phones?: string[]
    socials?: {
      type: string
      value: string
    }[]
  }
  sorters?: {
    priority?: string
    color?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createSupplierParams {
  name: string
  emails: string[]
  phones: string[]
  socials: {
    type: string
    value: string
  }[]
  comment: string
}

export interface SupplierResponse {
  status: string
  code: string
  message: string
  description: string
  suppliers: Supplier[]
  suppliersCount: number
}

export interface editSupplierParams {
  id: string
  name: string
  emails: string[]
  phones: string[]
  socials: {
    type: string
    value: string
  }[]
  comment: string
}

export interface removeSuppliersParams {
  ids: string[]
}
