import type { WarehouseTransactionDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { FieldErrors } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  useWarehouseTransactionRemove,
} from '@/api/hooks'

export type WarehouseTransactionTableRow = Omit<WarehouseTransactionDTO, 'fromWarehouse' | 'toWarehouse'> & {
  fromWarehouse?: string | { id?: string, names?: Partial<Record<'ru' | 'en', string>> } | null
  toWarehouse?: string | { id?: string, names?: Partial<Record<'ru' | 'en', string>> } | null
  items?: Array<{ quantity: number, product: { id: string } & Record<string, unknown> }>
}

interface WarehouseTransactionContextType {
  isLoading: boolean
  onError: (formErrors: FieldErrors<WarehouseTransactionFormValues>) => void
  removeWarehouseTransaction: (params: { ids: string[] }) => void
}

const WarehouseTransactionContext = createContext<WarehouseTransactionContextType | undefined>(undefined)

interface WarehouseTransactionFormValues {
  type: 'in' | 'out' | 'transfer'
  fromWarehouse: string
  toWarehouse: string
  requiresReceiving: boolean
  comment: string
  products: {
    id: string
    lineQuantity: number
    receivedQuantity: number
  }[]
}

export function WarehouseTransactionProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const queryClient = useQueryClient()

  const useMutateRemoveWarehouseTransaction = useWarehouseTransactionRemove({
    options: {
      onSuccess: ({ data }) => {
        setIsLoading(false)
        void queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsLoading(false)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeWarehouseTransaction = (params: { ids: string[] }) => {
    setIsLoading(true)
    useMutateRemoveWarehouseTransaction.mutate(params)
  }

  const onError = (formErrors: FieldErrors<WarehouseTransactionFormValues>) => {
    if (formErrors.products) {
      toast.error(String(formErrors.products.message ?? ''))
    }
  }

  const value: WarehouseTransactionContextType = useMemo(
    () => ({
      isLoading,
      onError,
      removeWarehouseTransaction,
    }),
    [isLoading, removeWarehouseTransaction],
  )

  return <WarehouseTransactionContext.Provider value={value}>{children}</WarehouseTransactionContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWarehouseTransactionContext(): WarehouseTransactionContextType {
  const context = useContext(WarehouseTransactionContext)
  if (!context) {
    throw new Error('useWarehouseTransactionContext - WarehouseTransactionContext')
  }
  return context
}
