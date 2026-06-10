import type { WarehouseDTO } from '@remnant/shared'
import type { ReactNode } from 'react'

import type { Resolver, UseFormReturn } from 'react-hook-form'
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

interface WarehouseContextType {
  selectedWarehouse: WarehouseDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<WarehouseFormValues>
  openModal: (warehouse?: WarehouseDTO) => void
  closeModal: () => void
  submitWarehouseForm: (params: WarehouseFormValues) => void
  removeWarehouses: (params: { ids: string[] }) => void
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined)

interface WarehouseFormValues {
  names: Record<string, string>
  priority: number
  active: boolean
}

export function WarehouseProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseDTO | undefined>(undefined)

  const { t } = useTranslation()

  const formSchema = useMemo(() => createWarehouseFormSchema(t), [t])

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(formSchema) as Resolver<WarehouseFormValues>,
    defaultValues: getWarehouseFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedWarehouse(undefined)
    form.reset()
  }

  const openModal = (warehouse?: WarehouseDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!warehouse)
    setSelectedWarehouse(warehouse)
    form.reset(getWarehouseFormValues(warehouse))
  }

  const useMutateCreateWarehouse = useWarehouseCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['warehouses'] })
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
        void queryClient.invalidateQueries({ queryKey: ['warehouses'] })
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
        void queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeWarehouses = (params: { ids: string[] }) => {
    useMutateRemoveWarehouse.mutate(params)
  }

  const submitWarehouseForm = (params: WarehouseFormValues) => {
    if (!selectedWarehouse || !isEdit)
      return useMutateCreateWarehouse.mutate(params)

    return useMutateEditWarehouse.mutate({ ...params, id: selectedWarehouse.id })
  }

  const isLoading = useMutateCreateWarehouse.isPending || useMutateEditWarehouse.isPending || useMutateRemoveWarehouse.isPending

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

function createWarehouseFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
    priority: z.number().default(0),
    active: z.boolean().default(true),
  })
}

function getWarehouseFormValues(warehouse?: WarehouseDTO): WarehouseFormValues {
  if (!warehouse) {
    return {
      names: {},
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
