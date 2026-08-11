import type { ProductPropertyDTO, ProductPropertyOptionDTO } from '@remnant/shared'
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
  useProductPropertyCreate,
  useProductPropertyEdit,
  useProductPropertyOptionCreate,
  useProductPropertyOptionEdit,
  useProductPropertyOptionRemove,
  useProductPropertyRemove,
} from '@/api/hooks/'

function createPropertyFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
    symbols: z.record(z.string()),
    priority: z.number().optional(),
    isRequired: z.boolean().optional(),
    showInTable: z.boolean().optional(),
    showInStatistics: z.boolean().optional(),
    type: z.string({ required_error: t('form.errors.required') }),
    active: z.boolean().optional(),
  })
}

export type ProductPropertyFormValues = z.infer<ReturnType<typeof createPropertyFormSchema>>

function getPropertyFormDefaults(property?: ProductPropertyDTO): ProductPropertyFormValues {
  if (!property) {
    return {
      names: {},
      symbols: {},
      priority: 0,
      isRequired: false,
      showInTable: false,
      showInStatistics: true,
      type: '',
      active: true,
    }
  }
  return {
    names: { ...property.names } as Record<string, string>,
    symbols: { ...property.symbols } as Record<string, string>,
    priority: property.priority,
    isRequired: property.isRequired,
    showInTable: property.showInTable,
    showInStatistics: property.showInStatistics,
    type: property.type,
    active: property.active,
  }
}

function createOptionFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
    priority: z.number().optional(),
    active: z.boolean().optional(),
    color: z.string().optional(),
  })
}

export type ProductPropertyOptionFormValues = z.infer<ReturnType<typeof createOptionFormSchema>>

function getOptionFormDefaults(option?: ProductPropertyOptionDTO): ProductPropertyOptionFormValues {
  if (!option) {
    return {
      names: {},
      priority: 0,
      color: '',
      active: true,
    }
  }
  return {
    names: { ...option.names } as Record<string, string>,
    priority: option.priority,
    color: option.color,
    active: option.active,
  }
}

interface ProductPropertiesContextType {
  selectedProperty: ProductPropertyDTO | null
  isPropertyModalOpen: boolean
  isOptionModalOpen: boolean
  isLoading: boolean
  isPropertyEdit: boolean
  isOptionsEdit: boolean
  propertyForm: UseFormReturn<ProductPropertyFormValues>
  optionForm: UseFormReturn<ProductPropertyOptionFormValues>
  openPropertyModal: (productProperty?: ProductPropertyDTO) => void
  closePropertyModal: () => void
  submitProductPropertyForm: (params: ProductPropertyFormValues) => void
  removeProperty: (params: { ids: string[] }) => void
  openOptionsModal: (option?: ProductPropertyOptionDTO, property?: ProductPropertyDTO) => void
  closeOptionsModal: () => void
  submitOptionsForm: (params: ProductPropertyOptionFormValues) => void
  removeOption: (params: { ids: string[] }) => void
}

const ProductPropertiesContext = createContext<ProductPropertiesContextType | undefined>(undefined)

export function ProductPropertiesProvider({ children }: { children: ReactNode }) {
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false)
  const [isPropertyEdit, setIsPropertyEdit] = useState(false)
  const [isOptionsEdit, setIsOptionsEdit] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<ProductPropertyDTO | null>(null)
  const [selectedOption, setSelectedOption] = useState<ProductPropertyOptionDTO | null>(null)

  const { t } = useTranslation()

  const propertyFormSchema = useMemo(() => createPropertyFormSchema(t), [t])

  const propertyForm = useForm<ProductPropertyFormValues>({
    resolver: zodResolver(propertyFormSchema) as Resolver<ProductPropertyFormValues>,
    defaultValues: getPropertyFormDefaults(),
  })

  const optionFormSchema = useMemo(() => createOptionFormSchema(t), [t])

  const optionForm = useForm<ProductPropertyOptionFormValues>({
    resolver: zodResolver(optionFormSchema) as Resolver<ProductPropertyOptionFormValues>,
    defaultValues: getOptionFormDefaults(),
  })

  const closePropertyModal = () => {
    if (!isPropertyModalOpen)
      return
    setIsPropertyModalOpen(false)
    setIsPropertyEdit(false)
    setSelectedProperty(null)
    propertyForm.reset()
  }

  const openPropertyModal = (property?: ProductPropertyDTO) => {
    setIsPropertyModalOpen(true)
    setIsPropertyEdit(!!property)
    setSelectedProperty(property ?? null)
    propertyForm.reset(getPropertyFormDefaults(property))
  }

  const openOptionsModal = (option?: ProductPropertyOptionDTO, property?: ProductPropertyDTO) => {
    setIsOptionModalOpen(true)
    setIsOptionsEdit(!!option)
    setSelectedOption(option ?? null)
    setSelectedProperty(property ?? null)
    optionForm.reset(getOptionFormDefaults(option))
  }

  const closeOptionsModal = () => {
    setIsOptionModalOpen(false)
    setSelectedOption(null)
    setSelectedProperty(null)
    optionForm.reset()
  }

  const queryClient = useQueryClient()

  const useMutateCreateProductProperty = useProductPropertyCreate({
    options: {
      onSuccess: ({ data }) => {
        closePropertyModal()
        void queryClient.invalidateQueries({ queryKey: ['product-properties'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closePropertyModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditProductProperty = useProductPropertyEdit({
    options: {
      onSuccess: ({ data }) => {
        closePropertyModal()
        void queryClient.invalidateQueries({ queryKey: ['product-properties'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closePropertyModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveProductProperty = useProductPropertyRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['product-properties'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateCreateProductPropertyOption = useProductPropertyOptionCreate({
    options: {
      onSuccess: ({ data }) => {
        closeOptionsModal()
        void queryClient.invalidateQueries({ queryKey: ['product-properties'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeOptionsModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditProductPropertyOption = useProductPropertyOptionEdit({
    options: {
      onSuccess: ({ data }) => {
        closeOptionsModal()
        void queryClient.invalidateQueries({ queryKey: ['product-properties-options'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeOptionsModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveProductPropertyOption = useProductPropertyOptionRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['product-properties'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitProductPropertyForm = (params: ProductPropertyFormValues) => {
    if (!selectedProperty)
      return useMutateCreateProductProperty.mutate(params)

    return useMutateEditProductProperty.mutate({ ...params, id: selectedProperty.id })
  }

  const submitOptionsForm = (params: ProductPropertyOptionFormValues) => {
    if (!selectedProperty)
      return
    if (!selectedOption)
      return useMutateCreateProductPropertyOption.mutate({ ...params, productPropertyId: selectedProperty.id })

    return useMutateEditProductPropertyOption.mutate({ ...params, id: selectedOption.id, productPropertyId: selectedProperty.id })
  }

  const removeProperty = (params: { ids: string[] }) => {
    useMutateRemoveProductProperty.mutate(params)
  }

  const removeOption = (params: { ids: string[] }) => {
    useMutateRemoveProductPropertyOption.mutate(params)
  }

  const isLoading
    = useMutateCreateProductProperty.isPending
      || useMutateEditProductProperty.isPending
      || useMutateRemoveProductProperty.isPending
      || useMutateCreateProductPropertyOption.isPending
      || useMutateEditProductPropertyOption.isPending
      || useMutateRemoveProductPropertyOption.isPending

  const value: ProductPropertiesContextType = useMemo(
    () => ({
      selectedProperty,
      isPropertyModalOpen,
      isPropertyEdit,
      isLoading,
      propertyForm,
      isOptionModalOpen,
      isOptionsEdit,
      optionForm,
      openPropertyModal,
      closePropertyModal,
      submitProductPropertyForm,
      removeProperty,
      openOptionsModal,
      closeOptionsModal,
      submitOptionsForm,
      removeOption,
    }),
    [
      selectedProperty,
      isPropertyModalOpen,
      isPropertyEdit,
      isLoading,
      propertyForm,
      isOptionModalOpen,
      isOptionsEdit,
      optionForm,
      openPropertyModal,
      closePropertyModal,
      submitProductPropertyForm,
      removeProperty,
      openOptionsModal,
      closeOptionsModal,
      submitOptionsForm,
      removeOption,
    ],
  )

  return <ProductPropertiesContext.Provider value={value}>{children}</ProductPropertiesContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductPropertiesContext(): ProductPropertiesContextType {
  const context = useContext(ProductPropertiesContext)
  if (!context) {
    throw new Error('useProductPropertiesContext - ProductPropertiesContext')
  }
  return context
}
