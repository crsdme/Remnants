interface authLoginResponse {
  status: string
  accessToken: string
  user: object
}

interface refreshTokenResponse {
  status: string
  accessToken: string
}
