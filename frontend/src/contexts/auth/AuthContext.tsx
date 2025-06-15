import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { toast } from 'sonner'
import { useAuthLogin, useAuthLogout, useRefreshToken } from '@/api/hooks'
import { setupAxiosInterceptors } from '@/api/instance'

interface AuthState {
  isAuthenticated: boolean
  isAuthChecked: boolean
  user: User | null
}

interface AuthContextType {
  state: AuthState
  user: User | null
  permissions: Array<string>
  dispatch: (state) => void
  login: (state) => void
  logout: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'profile'

function authReducer(state, action) {
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

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    isAuthChecked: false,
  })
  const [permissions, setPermissions] = useState([])

  const { t } = useTranslation()

  const [user, setUser] = useState<User | null>(null)

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
        setUser(data.user)
        setPermissions(data.user.permissions)
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
        dispatch({ type: 'LOGOUT' })
      },
    },
  })

  const login = (value) => {
    useMutateAuthLogin.mutate(value)
  }

  const refresh = () => {
    useQueryRefreshToken
      .refetch()
      .then(({ status, data }) => {
        if (status === 'success') {
          setPermissions(data.data.permissions)
          dispatch({ type: 'REFRESH' })
        }
        else {
          dispatch({ type: 'LOGOUT' })
        }
      })
  }

  const logout = () => {
    useMutateAuthLogout.mutate()
  }

  const sendToast = (data) => {
    toast.error(t(`error.title.${data.code}`), { description: `${t(`error.description.${data.code}`)} ${data.description}` })
  }

  useEffect(() => {
    refresh()
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
      dispatch,
      login,
      logout,
      refresh,
    }),
    [state, dispatch, login, logout, refresh, permissions],
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
