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
  useWarehouseCreate,
  useWarehouseEdit,
  useWarehouseRemove,
} from '@/api/hooks'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'

interface WarehouseContextType {
  selectedWarehouse: Warehouse
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (warehouse?: Warehouse) => void
  closeModal: () => void
  submitWarehouseForm: (params) => void
  removeWarehouses: (params: { ids: string[] }) => void
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined)

interface WarehouseProviderProps {
  children: ReactNode
}

export function WarehouseProvider({ children }: WarehouseProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)

  const { t } = useTranslation()

  const defaultLanguageValues = SUPPORTED_LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      priority: z.number().default(0),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: defaultLanguageValues,
      priority: 0,
      active: true,
    },
  })

  const queryClient = useQueryClient()

  function getWarehouseFormValues(warehouse) {
    if (!warehouse) {
      return {
        names: defaultLanguageValues,
        priority: 0,
        active: true,
      }
    }
    return {
      names: { ...warehouse.names },
      priority: warehouse.priority,
      active: warehouse.active,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedWarehouse(null)
    form.reset()
  }

  const openModal = (warehouse) => {
    setIsModalOpen(true)
    setIsEdit(!!warehouse)
    setSelectedWarehouse(warehouse)
    form.reset(getWarehouseFormValues(warehouse))
  }

  const useMutateCreateWarehouse = useWarehouseCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
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

  const useMutateEditWarehouse = useWarehouseEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
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

  const useMutateRemoveWarehouse = useWarehouseRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeWarehouses = (params) => {
    useMutateRemoveWarehouse.mutate(params)
  }

  const submitWarehouseForm = (params) => {
    setIsLoading(true)
    if (!selectedWarehouse)
      return useMutateCreateWarehouse.mutate(params)

    return useMutateEditWarehouse.mutate({ ...params, id: selectedWarehouse.id })
  }

  const value: WarehouseContextType = useMemo(
    () => ({
      selectedWarehouse,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitWarehouseForm,
      removeWarehouses,
    }),
    [selectedWarehouse, isModalOpen, isLoading, isEdit, form],
  )

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWarehouseContext(): WarehouseContextType {
  const context = useContext(WarehouseContext)
  if (!context) {
    throw new Error('useWarehouseContext - WarehouseContext')
  }
  return context
}
