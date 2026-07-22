import type { InventoryDTO } from '@remnant/shared'
import type { ReactNode } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useInventoryRemove } from '@/api/hooks'

export type InventoryTableRow = InventoryDTO

interface InventoryContextType {
  isLoading: boolean
  removeInventory: (params: { ids: string[] }) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const queryClient = useQueryClient()

  const useMutateRemoveInventory = useInventoryRemove({
    options: {
      onSuccess: ({ data }) => {
        setIsLoading(false)
        void queryClient.invalidateQueries({ queryKey: ['inventories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.message || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsLoading(false)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeInventory = (params: { ids: string[] }) => {
    setIsLoading(true)
    useMutateRemoveInventory.mutate(params)
  }

  const value: InventoryContextType = useMemo(
    () => ({
      isLoading,
      removeInventory,
    }),
    [isLoading, removeInventory],
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
