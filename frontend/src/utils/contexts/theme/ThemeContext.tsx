import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'

import { createContext, useContext, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

const LOCAL_STORAGE_KEY = 'theme'

interface Theme {
  language: string
  layoutTheme: string
  activeColumns: string[]
}

interface ThemeContextType {
  theme: Theme
  updateTheme: (newTheme: Partial<Theme>) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState({ language: 'en', layoutTheme: 'light', activeColumns: [] })
  const { i18n } = useTranslation()

  const updateTheme = ({ language, layoutTheme }) => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setTheme(state => ({ ...state, language, layoutTheme }))
    if (language)
      i18n.changeLanguage(language)
    if (layoutTheme)
      document.documentElement.classList.toggle('dark', layoutTheme === 'dark')
  }

  // eslint-disable-next-line react/no-unstable-context-value
  const value: ThemeContextType = {
    theme,
    updateTheme,
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedTheme)
      updateTheme(JSON.parse(storedTheme))
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(theme))
  }, [theme])

  return (
    <ThemeContext.Provider value={value}>
      <Toaster position="bottom-right" richColors />
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext - ThemeContext')
  }
  return context
}
