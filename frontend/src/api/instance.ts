import axios from 'axios'

import { backendUrl } from '@/utils/constants'

export const api = axios.create({
  baseURL: `${backendUrl}api/`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let requestInterceptor: number
let responseInterceptor: number

let isRefreshing = false
let isLoggingOut = false
let refreshPromise: Promise<void> | null = null

const failedQueue: Array<{
  resolve: () => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error)
      reject(error)
    else
      resolve()
  })
  failedQueue.length = 0
}

function isAuthRequest(url?: string) {
  return url?.includes('auth/refresh') || url?.includes('auth/logout') || url?.includes('auth/login')
}

function handleLogout(logout: () => void) {
  if (isLoggingOut)
    return
  isLoggingOut = true
  logout()
}

export function setupAxiosInterceptors({
  logout,
  refresh,
  sendToast,
}: {
  logout: () => void
  refresh: () => Promise<void>
  sendToast: ({ message, code, description }: { message: string, code: string, description: string }) => void
}) {
  if (requestInterceptor)
    api.interceptors.request.eject(requestInterceptor)
  if (responseInterceptor)
    api.interceptors.response.eject(responseInterceptor)

  isRefreshing = false
  isLoggingOut = false
  refreshPromise = null
  failedQueue.length = 0

  requestInterceptor = api.interceptors.request.use(
    config => config,
    async error => Promise.reject(error),
  )

  responseInterceptor = api.interceptors.response.use(
    response => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest(originalRequest.url)) {
        if (isRefreshing) {
          return new Promise<void>((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(async () => api.request(originalRequest))
        }

        originalRequest._retry = true
        isRefreshing = true

        refreshPromise ??= refresh()

        try {
          await refreshPromise
          processQueue(null)
          return await api.request(originalRequest)
        }
        catch (refreshError) {
          processQueue(refreshError)
          handleLogout(logout)
          throw refreshError
        }
        finally {
          isRefreshing = false
          refreshPromise = null
        }
      }

      if (error.response?.status === 403) {
        if (isAuthRequest(originalRequest.url)) {
          handleLogout(logout)
        }
        else {
          sendToast({
            message: error.response?.data?.error?.message || 'Request failed',
            code: error.response?.data?.error?.code || 'INTERNAL_ERROR',
            description: error.response?.data?.error?.description || '',
          })
        }

        return Promise.reject(error)
      }

      return Promise.reject(error)
    },
  )
}
