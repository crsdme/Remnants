import type { InventoryDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, useContext, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { z } from 'zod'

import { useInventoryQuery } from '@/api/hooks'

export interface ViewInventoryFormValues {
  warehouse: string
  categories: string[]
  comment?: string
  items: {
    id: string
    lineQuantity: number
    receivedQuantity?: number
  }[]
}

/** List / table row when API returns populated warehouse or category names */
export type ViewInventoryTableRow = InventoryDTO

interface ViewInventoryContextType {
  isLoading: boolean
  form: UseFormReturn<ViewInventoryFormValues>
  inventory: InventoryDTO | undefined
}

const ViewInventoryContext = createContext<ViewInventoryContextType | undefined>(undefined)

export function ViewInventoryProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { seq } = useParams()

  const formSchema = useMemo(() => createViewInventoryFormSchema(t), [t])

  const form = useForm<ViewInventoryFormValues>({
    resolver: zodResolver(formSchema) as Resolver<ViewInventoryFormValues>,
    defaultValues: getViewInventoryFormValues(),
  })

  const {
    inventories,
    isPending,
    isFetching,
  } = useInventoryQuery(
    { filters: { seq } },
    {
      options: {
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      },
    },
  )

  const inventory = inventories[0]

  useEffect(() => {
    if (!inventory?.id)
      return
    form.reset(getViewInventoryFormValues(inventory))
  }, [inventory?.id, form, inventory])

  const isLoading = isPending || isFetching

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

function createViewInventoryFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    warehouse: z.string({ required_error: t('form.errors.required') }),
    categories: z.array(z.string()).min(1, { message: t('form.errors.required') }),
    comment: z.string().optional(),
    items: z.array(z.object({
      id: z.string({ required_error: t('form.errors.required') }),
      lineQuantity: z.number({ required_error: t('form.errors.required') }),
      receivedQuantity: z.number().optional(),
    })).min(1, { message: t('form.errors.required.products') }),
  })
}

function getViewInventoryFormValues(inventory?: InventoryDTO): ViewInventoryFormValues {
  if (inventory === undefined) {
    return {
      warehouse: '',
      categories: [],
      comment: '',
      items: [],
    }
  }
  return {
    warehouse: inventory.warehouse.id,
    categories: inventory.categories.map(category => category.id),
    comment: inventory.comment ?? '',
    items: [],
  }
}
