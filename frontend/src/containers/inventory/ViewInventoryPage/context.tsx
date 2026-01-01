import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { z } from 'zod'
import {
  useInventoryItemsQuery,
  useInventoryQuery,
} from '@/api/hooks'

interface ViewInventoryContextType {
  isLoading: boolean
  form: UseFormReturn
  inventory: any
}

const ViewInventoryContext = createContext<ViewInventoryContextType | undefined>(undefined)

interface ViewInventoryProviderProps {
  children: ReactNode
}

export function ViewInventoryProvider({ children }: ViewInventoryProviderProps) {
  const { t } = useTranslation()
  const { seq } = useParams()
  const [isLoading, setIsLoading] = useState(false)

  const formSchema = z.object({
    warehouse: z.string({ required_error: t('form.errors.required') }),
    category: z.string({ required_error: t('form.errors.required') }),
    comment: z.string().optional(),
    items: z.array(z.object({
      id: z.string({ required_error: t('form.errors.required') }),
      quantity: z.number({ required_error: t('form.errors.required') }),
      receivedQuantity: z.number().optional(),
    })).min(1, { message: t('form.errors.required.products') }),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouse: '',
      category: '',
      comment: '',
      items: [],
    },
  })

  const { data: { inventory = {} } = {} } = useInventoryQuery(
    { filters: { seq: Number(seq) } },
    { options: {
      select: response => ({ inventory: response.data.inventories[0] }),
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    } },
  )

  // CAN BE REWORKED
  useEffect(() => {
    setIsLoading(true)

    if (inventory.id) {
      // if (order.orderStatus.isLocked && !hasPermission(permissions, 'order.editLocked')) {
      //   navigate('/orders')
      //   return
      // }

      form.reset({
        warehouse: inventory.warehouse.id,
        category: inventory.category.id,
        items: inventory.items.map((item) => {
          return {
            id: item.id,
            quantity: item.quantity,
            receivedQuantity: item.receivedQuantity,
          }
        }),
        comment: inventory.comment,
      })
    }
    setIsLoading(false)
  }, [inventory.id])

  const value: ViewInventoryContextType = useMemo(
    () => ({
      isLoading,
      form,
      inventory,
    }),
    [isLoading, form, inventory],
  )

  return <ViewInventoryContext.Provider value={value}>{children}</ViewInventoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useViewInventoryContext(): ViewInventoryContextType {
  const context = useContext(ViewInventoryContext)
  if (!context) {
    throw new Error('useViewInventoryContext - ViewInventoryContext')
  }
  return context
}
