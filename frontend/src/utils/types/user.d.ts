interface User {
  id: string
  name: string
  login: string
  password?: string
  active: boolean
  role: any
  seq: number
  createdAt: Date
  updatedAt: Date
  permissions: string[]
}

interface UsersResponse {
  status: string
  code: string
  message: string
  description: string
  users: User[]
  usersCount: number
}
