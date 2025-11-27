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
  useProductPropertyGroupCreate,
  useProductPropertyGroupEdit,
  useProductPropertyGroupRemove,
} from '@/api/hooks/'

interface ProductPropertiesGroupsContextType {
  selectedGroup: ProductPropertyGroup
  isModalOpen: boolean
  isLoading: boolean
  form: UseFormReturn
  isEdit: boolean
  openModal: (productPropertyGroup?: ProductPropertyGroup) => void
  closeModal: () => void
  submitGroupForm: (params) => void
  removeGroup: (params: { ids: string[] }) => void
}

const ProductPropertiesGroupsContext = createContext<ProductPropertiesGroupsContextType | undefined>(undefined)

interface ProductPropertiesGroupsProviderProps {
  children: ReactNode
}

export function ProductPropertiesGroupsProvider({ children }: ProductPropertiesGroupsProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      priority: z.number().optional(),
      productProperties: z.array(z.string()).optional(),
      active: z.boolean().optional(),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: {
        en: '',
        ru: '',
      },
      priority: 0,
      productProperties: [],
      active: true,
    },
  })

  const getGroupValues = (productPropertyGroup) => {
    if (!productPropertyGroup) {
      return {
        names: {},
        priority: 0,
        productProperties: [],
        active: true,
      }
    }
    return {
      names: { ...productPropertyGroup.names },
      priority: productPropertyGroup.priority,
      productProperties: productPropertyGroup.productProperties.map(productProperty => productProperty.id),
      active: productPropertyGroup.active,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedGroup(null)
    form.reset()
  }

  const openModal = (group) => {
    setIsModalOpen(true)
    setIsEdit(!!group)
    setSelectedGroup(group)
    form.reset(getGroupValues(group))
  }

  const queryClient = useQueryClient()

  const useMutateCreateProductPropertyGroup = useProductPropertyGroupCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['product-properties-groups'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditProductPropertyGroup = useProductPropertyGroupEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['product-properties-groups'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveProductPropertyGroup = useProductPropertyGroupRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['product-properties-groups'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitGroupForm = (params) => {
    setIsLoading(true)
    if (!selectedGroup)
      return useMutateCreateProductPropertyGroup.mutate(params)
    return useMutateEditProductPropertyGroup.mutate({ ...params, id: selectedGroup.id })
  }

  const removeGroup = (params) => {
    useMutateRemoveProductPropertyGroup.mutate(params)
  }

  const value: ProductPropertiesGroupsContextType = useMemo(
    () => ({
      selectedGroup,
      isModalOpen,
      isLoading,
      form,
      isEdit,
      openModal,
      closeModal,
      submitGroupForm,
      removeGroup,
    }),
    [selectedGroup, isModalOpen, isLoading, isEdit, form],
  )

  return <ProductPropertiesGroupsContext.Provider value={value}>{children}</ProductPropertiesGroupsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductPropertiesGroupsContext(): ProductPropertiesGroupsContextType {
  const context = useContext(ProductPropertiesGroupsContext)
  if (!context) {
    throw new Error('useProductPropertiesGroupsContext - ProductPropertiesGroupsContext')
  }
  return context
}
