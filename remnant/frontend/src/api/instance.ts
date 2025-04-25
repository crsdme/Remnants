import { backendUrl } from '@/utils/constants'

import axios from 'axios'

export const api = axios.create({
  baseURL: `${backendUrl}api/`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let requestInterceptor
let responseInterceptor

export function setupAxiosInterceptors({
  logout,
  refresh,
  sendToast,
}: {
  logout: () => void
  refresh: () => void
  sendToast: ({ title, description }: { title: string, description: string }) => void
}) {
  if (requestInterceptor)
    api.interceptors.request.eject(requestInterceptor)
  if (responseInterceptor)
    api.interceptors.response.eject(responseInterceptor)

  requestInterceptor = api.interceptors.request.use(
    config => config,
    error => Promise.reject(error),
  )

  responseInterceptor = api.interceptors.response.use(
    response => response,
    async (error) => {
      const originalRequest = error.config

      sendToast({
        title: `Error: ${error.response?.data?.message || 'Request failed'}`,
        description: error.toString(),
      })

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          refresh()
          return api.request(originalRequest)
        }
        catch (refreshError) {
          logout()
          return Promise.reject(refreshError)
        }
      }

      if (error.response?.status === 403) {
        logout()
        sendToast({
          title: `Error: ${error.response?.data?.message || 'Request failed'}`,
          description: error.toString(),
        })

        return Promise.reject(error)
      }

      return Promise.reject(error)
    },
  )
}
