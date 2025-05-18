interface User {
  id: string
  name: string
  login: string
  password?: string
  active: boolean
  seq: number
  createdAt: Date
  updatedAt: Date
}

interface UsersResponse {
  status: string
  code: string
  message: string
  description: string
  users: User[]
  usersCount: number
}
