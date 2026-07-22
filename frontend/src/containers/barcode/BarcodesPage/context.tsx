import type { ReactNode } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useBarcodeRemove } from '@/api/hooks'

interface BarcodeContextType {
  isLoading: boolean
  removeBarcodes: (params: { ids: string[] }) => void
}

const BarcodeContext = createContext<BarcodeContextType | undefined>(undefined)

export function BarcodeProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const useMutateRemoveBarcode = useBarcodeRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['barcodes'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.message || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeBarcodes = (params: { ids: string[] }) => {
    useMutateRemoveBarcode.mutate(params)
  }

  const isLoading = useMutateRemoveBarcode.isPending

  const value: BarcodeContextType = useMemo(
    () => ({
      isLoading,
      removeBarcodes,
    }),
    [isLoading],
  )

  return <BarcodeContext.Provider value={value}>{children}</BarcodeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBarcodeContext(): BarcodeContextType {
  const context = useContext(BarcodeContext)
  if (!context) {
    throw new Error('useBarcodeContext - BarcodeContext')
  }
  return context
}
