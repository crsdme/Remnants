interface User {
  _id: string
  name: string
  login: string
  password?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface UsersResponse {
  status: string
  users: User[]
  usersCount: number
}
