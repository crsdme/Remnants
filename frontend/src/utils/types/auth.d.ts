interface authLoginResponse {
  status: string
  accessToken: string
  user: User
}

interface refreshTokenResponse {
  status: string
  accessToken: string
}
