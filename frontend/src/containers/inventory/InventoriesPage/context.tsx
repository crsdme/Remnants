import type { InventoryDTO } from '@remnant/shared'
import type { ReactNode } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useInventoryExport, useInventoryRemove } from '@/api/hooks'
import { downloadBlob } from '@/utils/helpers/download'
import { useLocale } from '@/utils/hooks'

export type InventoryTableRow = InventoryDTO

interface InventoryContextType {
  isLoading: boolean
  removeInventory: (params: { ids: string[] }) => void
  exportInventoryExcel: (params: { id: string, seq: number }) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { t, language } = useLocale()
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

  const exportMutation = useInventoryExport({
    options: {
      onSuccess: ({ data, headers }) => {
        setIsLoading(false)
        const filename = headers['x-export-filename'] || 'inventory.xlsx'
        downloadBlob(data, filename)
        const code = headers['x-export-code'] || 'INVENTORY_EXPORTED'
        toast.success(t(`response.title.${code}`), {
          description: `${t(`response.description.${code}`)} ${headers['x-export-message'] || ''}`,
        })
      },
      onError: () => {
        setIsLoading(false)
        toast.error(t('page.inventories.export.error'))
      },
    },
  })

  const removeInventory = useCallback((params: { ids: string[] }) => {
    setIsLoading(true)
    useMutateRemoveInventory.mutate(params)
  }, [useMutateRemoveInventory])

  const exportInventoryExcel = useCallback((params: { id: string, seq: number }) => {
    setIsLoading(true)
    exportMutation.mutate({
      id: params.id,
      language,
      view: 'all',
    })
  }, [exportMutation, language])

  const value: InventoryContextType = useMemo(
    () => ({
      isLoading,
      removeInventory,
      exportInventoryExcel,
    }),
    [isLoading, removeInventory, exportInventoryExcel],
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
