import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LOCAL_STORAGE_KEY = 'settings'

interface AppSettingsContextType {
  settings: Setting[]
  getSetting: (key: string) => string | undefined
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined)

interface AppSettingsProviderProps {
  children: ReactNode
}

export function AppSettingsProvider({ children }: AppSettingsProviderProps) {
  const [settings, setSettings] = useState([])

  const getSetting = (key: string) => {
    return settings.find(setting => setting.key === key)?.value || undefined
  }

  useEffect(() => {
    const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedSettings)
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setSettings(JSON.parse(storedSettings))
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const value: AppSettingsContextType = useMemo(
    () => ({
      settings,
      getSetting,
    }),
    [settings],
  )

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppSettingsContext(): AppSettingsContextType {
  const context = useContext(AppSettingsContext)
  if (!context) {
    throw new Error('useAppSettingsContext - AppSettingsContext')
  }
  return context
}
