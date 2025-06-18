export interface getUserRolesParams {
  filters: {
    names?: string
    permissions?: string[]
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
    language?: string
  }
  sorters?: {
    names?: number
    permissions?: number
    active?: number
    priority?: number
    updatedAt?: number
    createdAt?: number
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createUserRolesParams {
  names: LanguageString
  permissions: string[]
  priority: number
  active?: boolean
}

export interface editUserRoleParams {
  id: string
  names: LanguageString
  permissions: string[]
  priority: number
  active?: boolean
}

export interface removeUserRolesParams {
  ids: string[]
}

export interface importUserRolesParams {
  file: File
}

export interface duplicateUserRolesParams {
  ids: string[]
}

export interface UserRolesResponse {
  status: string
  code: string
  message: string
  description: string
  userRoles: UserRole[]
  userRolesCount: number
}
