import type { ReactNode } from 'react'

import { createContext, useContext, useMemo } from 'react'

interface InventoryContextType {
  blank: any
  isLoading: boolean
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

interface InventoryProviderProps {
  children: ReactNode
}

export function InventoryProvider({ children }: InventoryProviderProps) {
  const blank = {}
  const value: InventoryContextType = useMemo(
    () => ({
      blank,
      isLoading: false,
    }),
    [blank],
  )

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInventoryContext(): InventoryContextType {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventoryContext - InventoryContext')
  }
  return context
}
