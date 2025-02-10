import axios from 'axios';
import { backendUrl } from '../constants';

export const api = axios.create({
  baseURL: `${backendUrl}api/`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

let requestInterceptor;
let responseInterceptor;

export const setupAxiosInterceptors = ({
  logout,
  notification,
  refresh
}: {
  logout: () => void;
  refresh: () => void;
  notification: ({ message, description }: { message: string; description: string }) => void;
}) => {
  if (requestInterceptor) api.interceptors.request.eject(requestInterceptor);
  if (responseInterceptor) api.interceptors.response.eject(responseInterceptor);

  requestInterceptor = api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );

  responseInterceptor = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          refresh();
          return api.request(originalRequest);
        } catch (refreshError) {
          logout();
          notification({
            message: `Error: ${refreshError.response?.data?.message || 'Request failed'}`,
            description: error.toString()
          });
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 403) {
        logout();
        notification({
          message: `Error: ${error.response?.data?.message || 'Request failed'}`,
          description: error.toString()
        });
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );

  // responseInterceptor = api.interceptors.response.use(
  //   (response) => response,
  //   (error) => {
  //     if (error.response?.status === 401) {
  //       refresh();
  //       return api.request(error.config);
  //     }

  //     if (error.response?.status === 403) {
  //       logout();
  //       return Promise.reject(error);
  //     }

  //     notification({
  //       message: `Error: ${error.response.data.message || 'Request failed'}`,
  //       description: error.toString()
  //     });

  //     return Promise.reject(error);
  //   }
  // );
};
