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
  useProductPropertyCreate,
  useProductPropertyEdit,
  useProductPropertyOptionCreate,
  useProductPropertyOptionEdit,
  useProductPropertyOptionRemove,
  useProductPropertyRemove,
} from '@/api/hooks/'

interface ProductPropertiesContextType {
  selectedProperty: ProductProperty
  isPropertyModalOpen: boolean
  isOptionModalOpen: boolean
  isLoading: boolean
  isPropertyEdit: boolean
  isOptionsEdit: boolean
  propertyForm: UseFormReturn
  optionForm: UseFormReturn
  openPropertyModal: (productProperty?: ProductProperty) => void
  closePropertyModal: () => void
  submitProductPropertyForm: (params) => void
  removeProperty: (params: { ids: string[] }) => void
  openOptionsModal: (option?: ProductPropertyOption, property?: ProductProperty) => void
  closeOptionsModal: () => void
  submitOptionsForm: (params) => void
  removeOption: (params: { ids: string[] }) => void
}

const ProductPropertiesContext = createContext<ProductPropertiesContextType | undefined>(undefined)

interface ProductPropertiesProviderProps {
  children: ReactNode
}

export function ProductPropertiesProvider({ children }: ProductPropertiesProviderProps) {
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false)
  const [isPropertyEdit, setIsPropertyEdit] = useState(false)
  const [isOptionsEdit, setIsOptionsEdit] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation()

  const propertyFormSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      priority: z.number().optional(),
      isRequired: z.boolean().optional(),
      showInTable: z.boolean().optional(),
      type: z.string().optional(),
      active: z.boolean().optional(),
    }), [t])

  const propertyForm = useForm({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      names: {
        en: '',
        ru: '',
      },
      priority: 0,
      isRequired: false,
      showInTable: false,
      type: '',
      active: true,
    },
  })

  const optionFormSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      priority: z.number().optional(),
      active: z.boolean().optional(),
      color: z.string().optional(),
    }), [t])

  const optionForm = useForm({
    resolver: zodResolver(optionFormSchema),
    defaultValues: {
      names: {
        en: '',
        ru: '',
      },
      priority: 0,
      active: true,
      color: '',
    },
  })

  const getPropertyValues = (property) => {
    if (!property) {
      return {
        names: {},
        priority: 0,
        isRequired: false,
        showInTable: false,
        type: '',
        active: true,
      }
    }
    return {
      names: { ...property.names },
      priority: property.priority,
      isRequired: property.isRequired,
      showInTable: property.showInTable,
      type: property.type,
      active: property.active,
    }
  }

  const getOptionValues = (option) => {
    if (!option) {
      return {
        names: {},
        priority: 0,
        color: '',
        active: true,
      }
    }
    return {
      names: { ...option.names },
      priority: option.priority,
      color: option.color,
      active: option.active,
    }
  }

  const closePropertyModal = () => {
    if (!isPropertyModalOpen)
      return
    setIsPropertyModalOpen(false)
    setIsLoading(false)
    setIsPropertyEdit(false)
    setSelectedProperty(null)
    propertyForm.reset()
  }

  const openPropertyModal = (property) => {
    setIsPropertyModalOpen(true)
    setIsPropertyEdit(!!property)
    setSelectedProperty(property)
    propertyForm.reset(getPropertyValues(property))
  }

  const openOptionsModal = (option, property) => {
    setIsOptionModalOpen(true)
    setIsOptionsEdit(!!option)
    setSelectedOption(option)
    setSelectedProperty(property)
    optionForm.reset(getOptionValues(option))
  }

  const closeOptionsModal = () => {
    setIsOptionModalOpen(false)
    setSelectedOption(null)
    setSelectedProperty(null)
    setIsLoading(false)
    optionForm.reset()
  }

  const queryClient = useQueryClient()

  const useMutateCreateProductProperty = useProductPropertyCreate({
    options: {
      onSuccess: ({ data }) => {
        closePropertyModal()
        queryClient.invalidateQueries({ queryKey: ['product-properties'] })
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
        queryClient.invalidateQueries({ queryKey: ['product-properties'] })
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
        queryClient.invalidateQueries({ queryKey: ['product-properties'] })
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
        queryClient.invalidateQueries({ queryKey: ['product-properties'] })
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
        queryClient.invalidateQueries({ queryKey: ['product-properties-options'] })
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
        queryClient.invalidateQueries({ queryKey: ['product-properties'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitProductPropertyForm = (params) => {
    setIsLoading(true)
    if (!selectedProperty)
      return useMutateCreateProductProperty.mutate(params)

    return useMutateEditProductProperty.mutate({ ...params, id: selectedProperty.id })
  }

  const submitOptionsForm = (params) => {
    setIsLoading(true)
    if (!selectedOption)
      return useMutateCreateProductPropertyOption.mutate({ ...params, productProperty: selectedProperty.id })

    return useMutateEditProductPropertyOption.mutate({ ...params, id: selectedOption.id, productProperty: selectedProperty.id })
  }

  const removeProperty = (params) => {
    useMutateRemoveProductProperty.mutate(params)
  }

  const removeOption = (params) => {
    useMutateRemoveProductPropertyOption.mutate(params)
  }

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
    [selectedProperty, isPropertyModalOpen, isLoading, isOptionModalOpen, optionForm],
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
