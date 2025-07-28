import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { z } from 'zod'
import {
  useWarehouseTransactionCreate,
  useWarehouseTransactionEdit,
  useWarehouseTransactionItemsOptions,
  useWarehouseTransactionReceive,
  useWarehouseTransactionRemove,
  useWarehouseTransactionScanOptions,
} from '@/api/hooks'

interface WarehouseTransactionContextType {
  selectedWarehouseTransaction: WarehouseTransaction
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  isReceiving: boolean
  form: UseFormReturn
  selectedTab: string
  getBarcode: (code: string) => Promise<any>
  onError: (formErrors) => void
  openModal: (warehouseTransaction?: WarehouseTransaction) => void
  editModal: (warehouseTransaction?: WarehouseTransaction) => void
  closeModal: () => void
  submitWarehouseTransactionForm: (params) => void
  removeWarehouseTransaction: (params: { ids: string[] }) => void
  setSelectedTab: (tab: string) => void
  receiveModal: (params: { id: string }) => void
}

const WarehouseTransactionContext = createContext<WarehouseTransactionContextType | undefined>(undefined)

interface WarehouseTransactionProviderProps {
  children: ReactNode
}

export function WarehouseTransactionProvider({ children }: WarehouseTransactionProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isReceiving, setIsReceiving] = useState(false)
  const [selectedTab, setSelectedTab] = useState('add')
  const [selectedWarehouseTransaction, setSelectedWarehouseTransaction] = useState(null)

  const { t } = useTranslation()

  const formSchema = z.object({
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
      quantity: z.number({
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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'in',
      fromWarehouse: '',
      toWarehouse: '',
      requiresReceiving: true,
      comment: '',
      products: [],
    },
  })

  const queryClient = useQueryClient()

  const loadWarehouseTransactionItemsOptions = useWarehouseTransactionItemsOptions()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setIsReceiving(false)
    setSelectedWarehouseTransaction(null)
    form.reset({
      type: 'in',
      fromWarehouse: '',
      toWarehouse: '',
      requiresReceiving: true,
      comment: '',
      products: [],
    })
  }

  const openModal = (warehouseTransaction) => {
    setIsModalOpen(true)
    setIsEdit(!!warehouseTransaction)
    setIsReceiving(false)
    setSelectedWarehouseTransaction(warehouseTransaction)
    form.reset({
      type: 'in',
      fromWarehouse: '',
      toWarehouse: '',
      requiresReceiving: true,
      comment: '',
      products: [],
    })
  }

  const editModal = async (warehouseTransaction) => {
    setIsLoading(true)
    setIsModalOpen(true)
    setIsEdit(true)
    setIsReceiving(false)
    setSelectedWarehouseTransaction(warehouseTransaction)
    const items = await loadWarehouseTransactionItemsOptions({ selectedValue: warehouseTransaction?.id ? [warehouseTransaction.id] : [] })
    const values = {
      type: warehouseTransaction.type,
      fromWarehouse: warehouseTransaction?.fromWarehouse?.id || undefined,
      toWarehouse: warehouseTransaction?.toWarehouse?.id || undefined,
      requiresReceiving: warehouseTransaction.requiresReceiving,
      comment: warehouseTransaction.comment,
      products: items.map(item => ({
        ...item.product,
        quantity: item.quantity,
      })),
    }
    form.reset(values)
    setIsLoading(false)
  }

  const receiveModal = async (warehouseTransaction) => {
    setIsLoading(true)
    setIsModalOpen(true)
    setIsEdit(false)
    setIsReceiving(true)
    setSelectedWarehouseTransaction(warehouseTransaction)
    const items = await loadWarehouseTransactionItemsOptions({ selectedValue: warehouseTransaction?.id ? [warehouseTransaction.id] : [] })
    const values = {
      type: warehouseTransaction.type,
      fromWarehouse: warehouseTransaction?.fromWarehouse?.id || undefined,
      toWarehouse: warehouseTransaction?.toWarehouse?.id || undefined,
      requiresReceiving: warehouseTransaction.requiresReceiving,
      comment: warehouseTransaction.comment,
      products: items.map(item => ({
        ...item.product,
        quantity: item.quantity,
        receivedQuantity: 0,
      })),
    }
    form.reset(values)
    setIsLoading(false)
  }

  const useMutateCreateWarehouseTransaction = useWarehouseTransactionCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] })
        queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditWarehouseTransaction = useWarehouseTransactionEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] })
        queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateReceiveWarehouseTransaction = useWarehouseTransactionReceive({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] })
        queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveWarehouseTransaction = useWarehouseTransactionRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] })
        queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const loadWarehouseTransactionScanOptions = useWarehouseTransactionScanOptions()

  const getBarcode = async (code: string) => {
    const { warehouseItems } = await loadWarehouseTransactionScanOptions({ barcode: code })
    return warehouseItems
  }

  const removeWarehouseTransaction = (params) => {
    useMutateRemoveWarehouseTransaction.mutate(params)
  }

  const submitWarehouseTransactionForm = (params) => {
    setIsLoading(true)

    if (isEdit) {
      return useMutateEditWarehouseTransaction.mutate({
        id: selectedWarehouseTransaction.id,
        type: params.type,
        fromWarehouse: params.fromWarehouse,
        toWarehouse: params.toWarehouse,
        requiresReceiving: params.requiresReceiving,
        comment: params.comment,
        products: params.products,
      })
    }

    if (isReceiving) {
      return useMutateReceiveWarehouseTransaction.mutate({
        id: selectedWarehouseTransaction.id,
        products: params.products,
      })
    }

    return useMutateCreateWarehouseTransaction.mutate({
      type: params.type,
      fromWarehouse: params.fromWarehouse,
      toWarehouse: params.toWarehouse,
      requiresReceiving: params.requiresReceiving,
      comment: params.comment,
      products: params.products,
    })
  }

  const onError = (formErrors) => {
    if (formErrors.products) {
      toast.error(formErrors.products.message)
    }
  }

  const value: WarehouseTransactionContextType = useMemo(
    () => ({
      selectedWarehouseTransaction,
      isModalOpen,
      isLoading,
      isEdit,
      isReceiving,
      form,
      selectedTab,
      getBarcode,
      onError,
      openModal,
      editModal,
      closeModal,
      submitWarehouseTransactionForm,
      removeWarehouseTransaction,
      receiveModal,
      setSelectedTab,
    }),
    [selectedWarehouseTransaction, isModalOpen, isLoading, isEdit, isReceiving, form, selectedTab, setSelectedTab],
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
