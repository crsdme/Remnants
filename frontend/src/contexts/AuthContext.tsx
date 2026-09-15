import type { LoginRequest, SettingDTO, UserAccessScopesDTO, UserDTO } from '@remnant/shared'
import type { Dispatch, ReactNode } from 'react'

import { emptyUserAccessScopes } from '@remnant/shared'
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthLogin, useAuthLogout, useRefreshToken } from '@/api/hooks'
import { setupAxiosInterceptors } from '@/api/instance'

interface AuthState {
  isAuthenticated: boolean
  isAuthChecked: boolean
  user?: UserDTO
}

export type AuthUser = UserDTO & { settings: SettingDTO[], permissions: string[], access: UserAccessScopesDTO }

interface AuthContextType {
  state: AuthState
  user: AuthUser | null
  permissions: string[]
  access: UserAccessScopesDTO
  dispatch: Dispatch<{ type: 'LOGIN' | 'REFRESH' | 'LOGOUT' }>
  login: (credentials: LoginRequest) => void
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'profile'

function authReducer(state: AuthState, action: { type: 'LOGIN' | 'REFRESH' | 'LOGOUT' }) {
  switch (action.type) {
    case 'LOGIN':
      return {
        isAuthenticated: true,
        isAuthChecked: true,
      }
    case 'REFRESH':
      return {
        isAuthenticated: true,
        isAuthChecked: true,
      }
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        isAuthChecked: true,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    isAuthChecked: false,
  })
  const [permissions, setPermissions] = useState<string[]>([])
  const [access, setAccess] = useState<UserAccessScopesDTO>({ ...emptyUserAccessScopes })

  const { t } = useTranslation()

  const [user, setUser] = useState<AuthUser | null>(null)

  const useQueryRefreshToken = useRefreshToken({
    options: {
      refetchOnWindowFocus: false,
      enabled: false,
      retry: 0,
    },
  })

  const useMutateAuthLogin = useAuthLogin({
    options: {
      onSuccess: ({ data }) => {
        const nextAccess = data.user.access ?? { ...emptyUserAccessScopes }
        setUser({
          ...data.user,
          settings: data.user.settings ?? [],
          permissions: data.user.permissions,
          access: nextAccess,
        } as AuthUser)
        setPermissions(data.user.permissions)
        setAccess(nextAccess)
        localStorage.setItem('settings', JSON.stringify(data.user.settings))
        dispatch({ type: 'LOGIN' })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description}` })
      },
    },
  })

  const useMutateAuthLogout = useAuthLogout({
    options: {
      onSuccess: () => {
        setAccess({ ...emptyUserAccessScopes })
        setPermissions([])
        dispatch({ type: 'LOGOUT' })
      },
    },
  })

  const login = (value: LoginRequest) => {
    useMutateAuthLogin.mutate(value)
  }

  const refresh = async (): Promise<void> => {
    return useQueryRefreshToken
      .refetch()
      .then(async ({ status, data }) => {
        if (status === 'success') {
          setPermissions(data.data.permissions)
          setAccess(data.data.access ?? { ...emptyUserAccessScopes })
          setUser(prev => prev
            ? {
                ...prev,
                permissions: data.data.permissions,
                access: data.data.access ?? { ...emptyUserAccessScopes },
              }
            : prev)
          dispatch({ type: 'REFRESH' })
          return
        }
        dispatch({ type: 'LOGOUT' })
        return Promise.reject(new Error('Token refresh failed'))
      })
  }

  const logout = () => {
    useMutateAuthLogout.mutate()
  }

  const sendToast = (data: { code: string, description: string }) => {
    toast.error(t(`error.title.${data.code}`), { description: `${t(`error.description.${data.code}`)} ${data.description}` })
  }

  useEffect(() => {
    void refresh()
    setupAxiosInterceptors({
      logout,
      refresh,
      sendToast,
    })
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedUser)
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setUser(JSON.parse(storedUser))
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user))
  }, [user])

  const value: AuthContextType = useMemo(
    () => ({
      state,
      user,
      permissions,
      access,
      dispatch,
      login,
      logout,
      refresh,
    }),
    [state, dispatch, login, logout, refresh, permissions, access, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext - AuthContext')
  }
  return context
}
