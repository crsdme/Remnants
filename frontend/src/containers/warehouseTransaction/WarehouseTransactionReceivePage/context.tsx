import type { WarehouseTransactionDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { FieldErrors, Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { toast } from 'sonner'
import { z } from 'zod'
import { useWarehouseTransactionDetails, useWarehouseTransactionReceive } from '@/api/hooks'
import { useAuthContext } from '@/contexts/'

export type WarehouseTransactionTableRow = Omit<WarehouseTransactionDTO, 'fromWarehouse' | 'toWarehouse'> & {
  fromWarehouse?: string | { id?: string, names?: Partial<Record<'ru' | 'en', string>> } | null
  toWarehouse?: string | { id?: string, names?: Partial<Record<'ru' | 'en', string>> } | null
  items?: Array<{ quantity: number, receivedQuantity?: number, product: { id: string } & Record<string, unknown> }>
}

interface WarehouseTransactionContextType {
  isLoading: boolean
  isViewMode: boolean
  warehouseTransaction: WarehouseTransactionDTO | null
  form: UseFormReturn<WarehouseTransactionFormValues>
  onError: (formErrors: FieldErrors<WarehouseTransactionFormValues>) => void
  submitWarehouseTransactionForm: (params: WarehouseTransactionFormValues) => void
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
    alreadyReceived: number
    receivedQuantity: number
  }[]
}

export function WarehouseTransactionProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthContext()
  const { t } = useTranslation()
  const { seq = '' } = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isViewMode = pathname.includes('/warehouse-transactions/view/')

  const formSchema = useMemo(() => createWarehouseTransactionFormSchema(t), [t])

  const form = useForm<WarehouseTransactionFormValues>({
    resolver: zodResolver(formSchema) as Resolver<WarehouseTransactionFormValues>,
    defaultValues: getWarehouseTransactionFormValues(),
  })

  const queryClient = useQueryClient()

  const { warehouseTransaction, warehouseTransactionItems } = useWarehouseTransactionDetails(
    { seq: Number(seq) },
    { options: { enabled: Number(seq) > 0 } },
  )

  const useMutateReceiveWarehouseTransaction = useWarehouseTransactionReceive({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        void queryClient.invalidateQueries({ queryKey: ['procurements'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
        setIsLoading(false)
        void navigate('/warehouse-transactions')
      },
      onError: ({ response }) => {
        setIsLoading(false)
        const error = response?.data?.error
        const code = typeof error === 'object' && error !== null ? error.code : 'undefined'
        const description = typeof error === 'object' && error !== null ? (error.description || '') : ''
        toast.error(t(`error.title.${code}`), { description: `${t(`error.description.${code}`)} ${description}` })
      },
    },
  })

  const submitWarehouseTransactionForm = useCallback(async (params: WarehouseTransactionFormValues) => {
    if (isViewMode) {
      return
    }

    const createdBy = user?.id
    if (!createdBy) {
      toast.error(t('form.errors.required'))
      return
    }

    if (!warehouseTransaction) {
      toast.error(t('form.errors.required'))
      return
    }

    setIsLoading(true)

    useMutateReceiveWarehouseTransaction.mutate({
      id: warehouseTransaction.id,
      ...(params.type === 'in' && params.toWarehouse ? { toWarehouseId: params.toWarehouse } : {}),
      products: params.products.map(p => ({
        id: p.id,
        quantity: p.lineQuantity,
        receivedQuantity: p.receivedQuantity ?? 0,
      })),
    })
  }, [isViewMode, warehouseTransaction, user?.id, t, useMutateReceiveWarehouseTransaction])

  const onError = useCallback((formErrors: FieldErrors<WarehouseTransactionFormValues>) => {
    const messages = Object.values(formErrors)
      .flatMap((error) => {
        if (!error)
          return []
        if ('message' in error && error.message)
          return [String(error.message)]
        return Object.values(error as Record<string, { message?: string }>)
          .map(item => item?.message)
          .filter((message): message is string => Boolean(message))
      })

    toast.error(messages[0] ?? t('form.errors.required'))
  }, [t])

  useEffect(() => {
    if (!warehouseTransaction)
      return

    if (!isViewMode && warehouseTransaction.status !== 'awaiting') {
      void navigate('/warehouse-transactions')
      return
    }

    form.reset({
      type: warehouseTransaction.type as 'in' | 'out' | 'transfer',
      fromWarehouse: warehouseTransaction?.fromWarehouse?.id ?? '',
      toWarehouse: warehouseTransaction?.toWarehouse?.id ?? '',
      requiresReceiving: warehouseTransaction.requiresReceiving,
      comment: warehouseTransaction.comment,
      products: warehouseTransactionItems.map((item) => {
        const ordered = item.quantity
        const alreadyReceived = item.receivedQuantity ?? 0
        const remaining = Math.max(0, ordered - alreadyReceived)
        const productId = item.productId || item.product?.id
        return {
          ...item.product,
          id: productId,
          product: productId,
          lineQuantity: ordered,
          alreadyReceived,
          receivedQuantity: isViewMode ? alreadyReceived : remaining,
        }
      }),
    })
  }, [warehouseTransaction, warehouseTransactionItems, navigate, form, isViewMode])

  const value: WarehouseTransactionContextType = useMemo(
    () => ({
      isLoading,
      isViewMode,
      warehouseTransaction,
      form,
      onError,
      submitWarehouseTransactionForm,
    }),
    [isLoading, isViewMode, warehouseTransaction, form, onError, submitWarehouseTransactionForm],
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
    fromWarehouse: z.string().optional().default(''),
    toWarehouse: z.string().optional().default(''),
    requiresReceiving: z.boolean().optional(),
    comment: z.string().nullish(),
    products: z.array(z.object({
      id: z.string().uuid({
        message: t('form.errors.required'),
      }),
      lineQuantity: z.coerce.number({
        required_error: t('form.errors.required'),
      }),
      alreadyReceived: z.coerce.number().optional(),
      receivedQuantity: z.coerce.number().min(0).optional(),
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
    products: warehouseTransaction.items?.map((item) => {
      const ordered = item.quantity
      const alreadyReceived = item.receivedQuantity ?? 0
      return {
        id: item.product.id,
        lineQuantity: ordered,
        alreadyReceived,
        receivedQuantity: alreadyReceived,
      }
    }) ?? [],
  }
}
