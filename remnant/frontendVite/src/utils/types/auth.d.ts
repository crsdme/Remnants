type authLoginResponse = {
  status: string;
  accessToken: string;
  user: object;
};

type refreshTokenResponse = {
  status: string;
  accessToken: string;
};
