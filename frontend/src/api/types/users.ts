export interface getUsersParams {
  filters: {
    name?: string
    login?: string
    active?: boolean[]
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
    login?: number
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

export interface createUsersParams {
  name: string
  login: string
  password: string
  active?: boolean
}

export interface editUserParams {
  id: string
  name: string
  login: string
  password: string
  active?: boolean
}

export interface removeUserParams {
  ids: string[]
}

export interface importUsersParams {
  file: File
}

export interface duplicateUserParams {
  ids: string[]
}

export interface UsersResponse {
  status: string
  code: string
  message: string
  description: string
  users: User[]
  usersCount: number
}
