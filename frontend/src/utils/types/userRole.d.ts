interface UserRole {
  id: string
  names: LanguageString
  permissions: string[]
  priority: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface UserRolesResponse {
  status: string
  code: string
  message: string
  description: string
  userRoles: UserRole[]
  userRolesCount: number
}
