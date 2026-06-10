import type { ProductPropertyGroupPopulatedDTO } from '@remnant/shared'
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
  useProductPropertyGroupCreate,
  useProductPropertyGroupEdit,
  useProductPropertyGroupRemove,
} from '@/api/hooks/'

function createGroupFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
    priority: z.number().optional(),
    productProperties: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  })
}

type ProductPropertyGroupFormValues = z.infer<ReturnType<typeof createGroupFormSchema>>

function getGroupFormDefaults(productPropertyGroup?: any): ProductPropertyGroupFormValues {
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
    productProperties: productPropertyGroup.productProperties.map((productProperty: { id: string }) => productProperty.id),
    active: productPropertyGroup.active,
  }
}

interface ProductPropertiesGroupsContextType {
  selectedGroup: ProductPropertyGroupPopulatedDTO | null
  isModalOpen: boolean
  isLoading: boolean
  form: UseFormReturn<ProductPropertyGroupFormValues>
  isEdit: boolean
  openModal: (productPropertyGroup?: ProductPropertyGroupPopulatedDTO) => void
  closeModal: () => void
  submitGroupForm: (params: ProductPropertyGroupFormValues) => void
  removeGroup: (params: { ids: string[] }) => void
}

const ProductPropertiesGroupsContext = createContext<ProductPropertiesGroupsContextType | undefined>(undefined)

export function ProductPropertiesGroupsProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<ProductPropertyGroupPopulatedDTO | null>(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() => createGroupFormSchema(t), [t])

  const form = useForm<ProductPropertyGroupFormValues>({
    resolver: zodResolver(formSchema) as Resolver<ProductPropertyGroupFormValues>,
    defaultValues: getGroupFormDefaults(),
  })

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setSelectedGroup(null)
    form.reset()
  }

  const openModal = (group?: ProductPropertyGroupPopulatedDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!group)
    setSelectedGroup(group ?? null)
    form.reset(getGroupFormDefaults(group))
  }

  const queryClient = useQueryClient()

  const useMutateCreateProductPropertyGroup = useProductPropertyGroupCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['product-properties-groups'] })
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
        void queryClient.invalidateQueries({ queryKey: ['product-properties-groups'] })
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
        void queryClient.invalidateQueries({ queryKey: ['product-properties-groups'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitGroupForm = (params: ProductPropertyGroupFormValues) => {
    if (!selectedGroup)
      return useMutateCreateProductPropertyGroup.mutate(params)
    return useMutateEditProductPropertyGroup.mutate({ ...params, id: selectedGroup.id })
  }

  const removeGroup = (params: { ids: string[] }) => {
    useMutateRemoveProductPropertyGroup.mutate(params)
  }

  const isLoading = useMutateCreateProductPropertyGroup.isPending || useMutateEditProductPropertyGroup.isPending || useMutateRemoveProductPropertyGroup.isPending

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
