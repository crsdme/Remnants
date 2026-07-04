import type { WarehouseTransactionDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { FieldErrors, Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { toast } from 'sonner'
import { z } from 'zod'
import { useWarehouseTransactionCreate } from '@/api/hooks'
import { useAuthContext } from '@/contexts/'

export type WarehouseTransactionTableRow = Omit<WarehouseTransactionDTO, 'fromWarehouse' | 'toWarehouse'> & {
  fromWarehouse?: string | { id?: string, names?: Partial<Record<'ru' | 'en', string>> } | null
  toWarehouse?: string | { id?: string, names?: Partial<Record<'ru' | 'en', string>> } | null
  items?: Array<{ quantity: number, product: { id: string } & Record<string, unknown> }>
}

interface WarehouseTransactionContextType {
  isLoading: boolean
  form: UseFormReturn<WarehouseTransactionFormValues>
  selectedTab: string
  onError: (formErrors: FieldErrors<WarehouseTransactionFormValues>) => void
  submitWarehouseTransactionForm: (params: WarehouseTransactionFormValues) => void
  setSelectedTab: (tab: string) => void
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
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('add')
  const { user } = useAuthContext()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const formSchema = useMemo(() => createWarehouseTransactionFormSchema(t), [t])

  const form = useForm<WarehouseTransactionFormValues>({
    resolver: zodResolver(formSchema) as Resolver<WarehouseTransactionFormValues>,
    defaultValues: getWarehouseTransactionFormValues(),
  })

  const queryClient = useQueryClient()

  const useMutateCreateWarehouseTransaction = useWarehouseTransactionCreate({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitWarehouseTransactionForm = async (params: WarehouseTransactionFormValues) => {
    setIsLoading(true)

    const productsForEditOrCreate = params.products.map(p => ({
      id: p.id,
      quantity: p.lineQuantity,
    }))

    const createdBy = user?.id
    if (!createdBy) {
      setIsLoading(false)
      return
    }

    void useMutateCreateWarehouseTransaction.mutate({
      type: params.type,
      fromWarehouse: params.fromWarehouse,
      toWarehouse: params.toWarehouse,
      requiresReceiving: params.requiresReceiving,
      comment: params.comment,
      products: productsForEditOrCreate,
      createdBy,
    })

    setIsLoading(false)
    void navigate('/warehouse-transactions')
  }

  const onError = (formErrors: FieldErrors<WarehouseTransactionFormValues>) => {
    if (formErrors.products) {
      toast.error(String(formErrors.products.message ?? ''))
    }
  }

  const value: WarehouseTransactionContextType = useMemo(
    () => ({
      isLoading,
      form,
      selectedTab,
      onError,
      submitWarehouseTransactionForm,
      setSelectedTab,
    }),
    [isLoading, form, selectedTab, setSelectedTab],
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

function createWarehouseTransactionFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    type: z.enum(['in', 'out', 'transfer'], {
      required_error: t('form.errors.required'),
    }),
    fromWarehouse: z.string({
      required_error: t('form.errors.required'),
    }),
    toWarehouse: z.string({
      required_error: t('form.errors.required'),
    }),
    requiresReceiving: z.boolean().optional(),
    comment: z.string().optional(),
    products: z.array(z.object({
      id: z.string({
        required_error: t('form.errors.required'),
      }),
      lineQuantity: z.number({
        required_error: t('form.errors.required'),
      }),
      receivedQuantity: z.number().optional(),
    })).min(1, { message: t('form.errors.required.products') }),
  }).superRefine((data, ctx) => {
    if (data.type === 'out' && (!data.fromWarehouse || data.fromWarehouse.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('form.errors.required'),
        path: ['fromWarehouse'],
      })
    }

    if (data.type === 'in' && (!data.toWarehouse || data.toWarehouse.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('form.errors.required'),
        path: ['toWarehouse'],
      })
    }

    if (data.type === 'transfer') {
      if (!data.fromWarehouse || data.fromWarehouse.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('form.errors.required'),
          path: ['fromWarehouse'],
        })
      }
      if (!data.toWarehouse || data.toWarehouse.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('form.errors.required'),
          path: ['toWarehouse'],
        })
      }
    }
  })
}

function getWarehouseTransactionFormValues(warehouseTransaction?: WarehouseTransactionTableRow): WarehouseTransactionFormValues {
  if (warehouseTransaction === undefined) {
    return {
      type: 'in',
      fromWarehouse: '',
      toWarehouse: '',
      requiresReceiving: true,
      comment: '',
      products: [],
    }
  }
  return {
    type: warehouseTransaction.type as WarehouseTransactionFormValues['type'],
    fromWarehouse: typeof warehouseTransaction.fromWarehouse === 'string'
      ? warehouseTransaction.fromWarehouse
      : warehouseTransaction.fromWarehouse?.id ?? '',
    toWarehouse: typeof warehouseTransaction.toWarehouse === 'string'
      ? warehouseTransaction.toWarehouse
      : warehouseTransaction.toWarehouse?.id ?? '',
    requiresReceiving: warehouseTransaction.requiresReceiving,
    comment: warehouseTransaction.comment,
    products: warehouseTransaction.items?.map(item => ({
      id: item.product.id,
      lineQuantity: item.quantity,
      receivedQuantity: 0,
    })) ?? [],
  }
}
