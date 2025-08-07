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
  useInventoryCreate,
  useInventoryEdit,
  useInventoryItemsOptions,
  useInventoryRemove,
} from '@/api/hooks'
import { useInventoryScanOptions } from '@/api/hooks/inventory/useInventoryScanOptions'

interface InventoryContextType {
  selectedInventory: Inventory
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  selectedTab: string
  getBarcode: (code: string) => Promise<any>
  onError: (formErrors) => void
  openModal: (inventory?: Inventory) => void
  editModal: (inventory?: Inventory) => void
  closeModal: () => void
  submitInventoryForm: (params) => void
  removeInventory: (params: { ids: string[] }) => void
  setSelectedTab: (tab: string) => void
  receiveModal: (params: { id: string }) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

interface InventoryProviderProps {
  children: ReactNode
}

export function InventoryProvider({ children }: InventoryProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedTab, setSelectedTab] = useState('add')
  const [selectedInventory, setSelectedInventory] = useState(null)

  const { t } = useTranslation()

  const formSchema = z.object({
    warehouse: z.string({
      required_error: t('form.errors.required'),
    }),
    comment: z.string().optional(),
    items: z.array(z.object({
      id: z.string({
        required_error: t('form.errors.required'),
      }),
      quantity: z.number({
        required_error: t('form.errors.required'),
      }),
      receivedQuantity: z.number().optional(),
    })).min(1, { message: t('form.errors.required.products') }),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouse: '',
      comment: '',
      items: [],
    },
  })

  const queryClient = useQueryClient()

  const loadInventoryItemsOptions = useInventoryItemsOptions()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedInventory(null)
    form.reset({
      warehouse: '',
      comment: '',
      items: [],
    })
  }

  const openModal = (inventory) => {
    setIsModalOpen(true)
    setIsEdit(!!inventory)
    setSelectedInventory(inventory)
    form.reset({
      warehouse: '',
      comment: '',
      items: [],
    })
  }

  const editModal = async (inventory) => {
    setIsLoading(true)
    setIsModalOpen(true)
    setIsEdit(true)
    setSelectedInventory(inventory)
    const items = await loadInventoryItemsOptions({ selectedValue: inventory?.id ? [inventory.id] : [] })
    const values = {
      warehouse: inventory?.warehouse?.id || undefined,
      comment: inventory.comment,
      items: items.map(item => ({
        ...item.product,
        quantity: item.quantity,
      })),
    }
    form.reset(values)
    setIsLoading(false)
  }

  const receiveModal = async (inventory) => {
    setIsLoading(true)
    setIsModalOpen(true)
    setIsEdit(false)
    setSelectedInventory(inventory)
    const items = await loadInventoryItemsOptions({ selectedValue: inventory?.id ? [inventory.id] : [] })
    const values = {
      warehouse: inventory?.warehouse?.id || undefined,
      comment: inventory.comment,
      items: items.map(item => ({
        ...item.product,
        quantity: item.quantity,
        receivedQuantity: 0,
      })),
    }
    form.reset(values)
    setIsLoading(false)
  }

  const useMutateCreateInventory = useInventoryCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['inventories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditInventory = useInventoryEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['inventories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveInventory = useInventoryRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['inventories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const loadInventoryScanOptions = useInventoryScanOptions()

  const getBarcode = async (code: string) => {
    const { inventoryItems } = await loadInventoryScanOptions({ barcode: code })
    return inventoryItems
  }

  const removeInventory = (params) => {
    useMutateRemoveInventory.mutate(params)
  }

  const submitInventoryForm = (params) => {
    setIsLoading(true)

    if (isEdit) {
      return useMutateEditInventory.mutate({
        id: selectedInventory.id,
        warehouse: params.warehouse,
        comment: params.comment,
        items: params.items,
      })
    }

    return useMutateCreateInventory.mutate({
      warehouse: params.warehouse,
      comment: params.comment,
      items: params.items,
    })
  }

  const onError = (formErrors) => {
    if (formErrors.items) {
      toast.error(formErrors.items.message)
    }
  }

  const value: InventoryContextType = useMemo(
    () => ({
      selectedInventory,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      selectedTab,
      getBarcode,
      onError,
      openModal,
      editModal,
      closeModal,
      submitInventoryForm,
      removeInventory,
      receiveModal,
      setSelectedTab,
    }),
    [selectedInventory, isModalOpen, isLoading, isEdit, form, selectedTab, setSelectedTab],
  )

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInventoryContext(): InventoryContextType {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventoryContext - InventoryContext')
  }
  return context
}
