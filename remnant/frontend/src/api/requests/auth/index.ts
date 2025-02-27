import { api } from '@/api/instance';

export type postAuthLoginParams = {
  login: string;
  password: string;
  type: string;
};

export const postAuthLogin = async (params: postAuthLoginParams) =>
  api.post<authLoginResponse>('auth/login', { ...params });

export const postRefreshToken = async () => api.post<refreshTokenResponse>('auth/refresh');

export const postAuthLogout = async () => api.post<refreshTokenResponse>('auth/logout');
