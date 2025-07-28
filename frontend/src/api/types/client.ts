export interface getClientsParams {
  filters?: {
    ids?: string[]
    name?: string
    middleName?: string
    lastName?: string
    emails?: string[]
    phones?: string[]
    addresses?: string[]
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

export interface createClientParams {
  name: string
  middleName?: string
  lastName: string
  emails: string[]
  phones: string[]
  addresses: string[]
  comment: string
}

export interface ClientResponse {
  status: string
  code: string
  message: string
  description: string
  clients: Client[]
  clientsCount: number
}

export interface editClientParams {
  id: string
  name: string
  middleName?: string
  lastName: string
  emails: string[]
  phones: string[]
  addresses: string[]
  comment: string
}

export interface removeClientsParams {
  ids: string[]
}
