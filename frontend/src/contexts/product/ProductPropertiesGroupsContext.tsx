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
  useCreateProductPropertyGroup,
  useEditProductPropertyGroup,
  useRemoveProductPropertyGroup,
} from '@/api/hooks/'

interface ProductPropertiesGroupsContextType {
  selectedProductPropertyGroup: ProductPropertyGroup
  isModalOpen: boolean
  isLoading: boolean
  form: UseFormReturn
  toggleModal: (productPropertyGroup?: ProductPropertyGroup) => void
  openModal: (productPropertyGroup?: ProductPropertyGroup) => void
  closeModal: () => void
  submitProductPropertyGroupForm: (params) => void
  removeProductPropertyGroup: (params: { ids: string[] }) => void
}

const ProductPropertiesGroupsContext = createContext<ProductPropertiesGroupsContextType | undefined>(undefined)

interface ProductPropertiesGroupsProviderProps {
  children: ReactNode
}

export function ProductPropertiesGroupsProvider({ children }: ProductPropertiesGroupsProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProductPropertyGroup, setSelectedProductPropertyGroup] = useState(null)

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

  const queryClient = useQueryClient()

  const useMutateCreateProductPropertyGroup = useCreateProductPropertyGroup({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProductPropertyGroup(null)
        queryClient.invalidateQueries({ queryKey: ['product-properties-groups'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProductPropertyGroup(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditProductPropertyGroup = useEditProductPropertyGroup({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProductPropertyGroup(null)
        queryClient.invalidateQueries({ queryKey: ['product-properties-groups'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProductPropertyGroup(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveProductPropertyGroup = useRemoveProductPropertyGroup({
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

  const openModal = (productPropertyGroup) => {
    setIsModalOpen(true)
    let productPropertyGroupValues = {}
    if (productPropertyGroup) {
      setSelectedProductPropertyGroup(productPropertyGroup)
      productPropertyGroupValues = {
        names: { ...productPropertyGroup.names },
        priority: productPropertyGroup.priority,
        productProperties: productPropertyGroup.productProperties.map(productProperty => productProperty.id),
        active: productPropertyGroup.active,
      }
    }

    form.reset(productPropertyGroupValues)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedProductPropertyGroup(null)
    form.reset()
  }

  const toggleModal = product => (isModalOpen ? closeModal() : openModal(product))

  const submitProductPropertyGroupForm = (params) => {
    setIsLoading(true)
    if (!selectedProductPropertyGroup) {
      useMutateCreateProductPropertyGroup.mutate(params)
    }
    else {
      useMutateEditProductPropertyGroup.mutate({ ...params, id: selectedProductPropertyGroup.id })
    }
  }

  const removeProductPropertyGroup = (params) => {
    useMutateRemoveProductPropertyGroup.mutate(params)
  }

  const value: ProductPropertiesGroupsContextType = useMemo(
    () => ({
      selectedProductPropertyGroup,
      isModalOpen,
      isLoading,
      form,
      toggleModal,
      openModal,
      closeModal,
      submitProductPropertyGroupForm,
      removeProductPropertyGroup,
    }),
    [selectedProductPropertyGroup, isModalOpen, isLoading, openModal, closeModal, submitProductPropertyGroupForm, removeProductPropertyGroup],
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
