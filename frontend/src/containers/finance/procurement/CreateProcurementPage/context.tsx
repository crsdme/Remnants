import type { ProcurementItemDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { toast } from 'sonner'
import { z } from 'zod'

import {
  useCurrencyQuery,
  useProcurementCreate,
  useProcurementEdit,
  useProcurementItemsQuery,
  useProcurementQuery,
  useProductQuery,
} from '@/api/hooks'
import { useProcurementItemsOptions } from '@/api/hooks/procurement/useProcurementItemsOptions'
import { fromMinor } from '@/utils/helpers'

export interface CreateProcurementFormValues {
  comment?: string
  supplierId: string
  warehouseId: string
  items: {
    id: string
    quantity: number
    purchasePrice: number
    purchaseCurrencyId: { id: string }
  }[]
}

interface CreateProcurementContextType {
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<CreateProcurementFormValues>
  getBarcode: (code: string) => Promise<ProcurementItemDTO[]>
  submitCreateProcurementForm: (params: CreateProcurementFormValues) => void
}

const CreateProcurementContext = createContext<CreateProcurementContextType | undefined>(undefined)

interface CreateProcurementProviderProps {
  children: ReactNode
}

export function CreateProcurementProvider({ children }: CreateProcurementProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { seq = '' } = useParams()
  const seqNumber = Number(seq)
  const isEdit = seqNumber > 0

  const { t } = useTranslation()
  const navigate = useNavigate()

  const formSchema = useMemo(() => createCreateProcurementFormSchema(t), [t])

  const form = useForm<CreateProcurementFormValues>({
    resolver: zodResolver(formSchema) as Resolver<CreateProcurementFormValues>,
    defaultValues: getCreateProcurementFormDefaults(),
  })

  const queryClient = useQueryClient()
  const { currencies } = useCurrencyQuery({ pagination: { full: true } })

  const { procurements: [procurement], isLoading: isProcurementLoading } = useProcurementQuery(
    { filters: { seq: [seq] } },
    { options: { enabled: isEdit } },
  )

  const { procurementItems, isLoading: isItemsLoading } = useProcurementItemsQuery(
    {
      filters: { procurementId: procurement?.id },
      pagination: { full: true },
    },
    { options: { enabled: Boolean(procurement?.id) } },
  )

  const productIds = useMemo(
    () => [...new Set(procurementItems.map(item => item.productId).filter(Boolean))],
    [procurementItems],
  )

  const { products, isLoading: isProductsLoading } = useProductQuery(
    {
      filters: { ids: productIds },
      pagination: { full: true },
    },
    { options: { enabled: isEdit && productIds.length > 0 } },
  )

  useEffect(() => {
    if (!isEdit || !procurement || isItemsLoading)
      return
    if (productIds.length > 0 && isProductsLoading)
      return

    const productsById = new Map(products.map(product => [product.id, product]))

    form.reset({
      comment: procurement.comment ?? '',
      supplierId: procurement.supplierId,
      warehouseId: procurement.warehouseId ?? '',
      items: procurementItems.map((item) => {
        const product = productsById.get(item.productId)
        const currency = currencies.find(row => row.id === item.purchaseCurrencyId)
          ?? product?.purchaseCurrency
        const scale = currency?.scale ?? 2
        return {
          ...product,
          ...item.product,
          id: item.productId,
          quantity: item.quantity,
          purchasePrice: Number(fromMinor(item.minorPurchasePrice ?? 0, scale)),
          purchaseCurrencyId: currency ?? { id: item.purchaseCurrencyId ?? '' },
        }
      }),
    })
  }, [currencies, form, isEdit, isItemsLoading, isProductsLoading, procurement, procurementItems, productIds.length, products])

  const useMutateCreateProcurement = useProcurementCreate({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['procurements'] })
        void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.message}` })
        setIsLoading(false)
        void navigate('/procurements')
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
        setIsLoading(false)
      },
    },
  })

  const useMutateEditProcurement = useProcurementEdit({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['procurements'] })
        void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.message}` })
        setIsLoading(false)
        void navigate('/procurements')
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
        setIsLoading(false)
      },
    },
  })

  const submitCreateProcurementForm = useCallback((params: CreateProcurementFormValues) => {
    setIsLoading(true)
    if (isEdit && procurement) {
      if (procurement.status !== 'draft') {
        setIsLoading(false)
        toast.error(t('error.title.PROCUREMENT_NOT_DRAFT'))
        return
      }
      return useMutateEditProcurement.mutate({
        id: procurement.id,
        comment: params.comment,
        items: params.items,
        supplierId: params.supplierId,
        warehouseId: params.warehouseId,
      })
    }

    return useMutateCreateProcurement.mutate({
      comment: params.comment,
      items: params.items,
      supplierId: params.supplierId,
      ...(params.warehouseId ? { warehouseId: params.warehouseId } : {}),
    })
  }, [isEdit, procurement, t, useMutateCreateProcurement, useMutateEditProcurement])

  const loadProcurementItemsOptions = useProcurementItemsOptions()

  const getBarcode = useCallback(async (code: string) => {
    return loadProcurementItemsOptions({ selectedValue: [code] })
  }, [loadProcurementItemsOptions])

  const value: CreateProcurementContextType = useMemo(
    () => ({
      isLoading: isLoading || (isEdit && (isProcurementLoading || isItemsLoading || isProductsLoading)),
      isEdit,
      form,
      getBarcode,
      submitCreateProcurementForm,
    }),
    [form, getBarcode, isEdit, isItemsLoading, isLoading, isProcurementLoading, isProductsLoading, submitCreateProcurementForm],
  )

  return <CreateProcurementContext.Provider value={value}>{children}</CreateProcurementContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreateProcurementContext(): CreateProcurementContextType {
  const context = useContext(CreateProcurementContext)
  if (!context) {
    throw new Error('useCreateProcurementContext - CreateProcurementContext')
  }
  return context
}

function createCreateProcurementFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    comment: z.string().optional(),
    supplierId: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
    warehouseId: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
    items: z.array(z.object({
      id: z.string({ required_error: t('form.errors.required') }),
      quantity: z.number({ required_error: t('form.errors.required') }),
      purchasePrice: z.number({ required_error: t('form.errors.required') }),
      purchaseCurrencyId: z.object({
        id: z.string({ required_error: t('form.errors.required') }),
      }),
    })).min(1, { message: t('form.errors.required.products') }),
  })
}

function getCreateProcurementFormDefaults(): CreateProcurementFormValues {
  return {
    comment: '',
    supplierId: '',
    warehouseId: '',
    items: [],
  }
}
