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
  useCreateProductProperty,
  useCreateProductPropertyOption,
  useEditProductProperty,
  useEditProductPropertyOption,
  useRemoveProductProperties,
  useRemoveProductPropertyOptions,
} from '@/api/hooks/'

interface ProductPropertiesContextType {
  selectedProductProperty: ProductProperty
  isModalOpen: boolean
  isOptionsModalOpen: boolean
  isLoading: boolean
  form: UseFormReturn
  toggleModal: (productProperty?: ProductProperty) => void
  openModal: (productProperty?: ProductProperty) => void
  closeModal: () => void
  submitProductPropertyForm: (params) => void
  removeProductProperty: (params: { ids: string[] }) => void
  optionsForm: UseFormReturn
  openOptionsModal: (params?: { option: ProductPropertyOption, property: string }) => void
  closeOptionsModal: () => void
  submitOptionsForm: (params) => void
  removeProductPropertyOption: (params: { ids: string[] }) => void
  toggleOptionsModal: (productPropertyOption?: ProductPropertyOption) => void
}

const ProductPropertiesContext = createContext<ProductPropertiesContextType | undefined>(undefined)

interface ProductPropertiesProviderProps {
  children: ReactNode
}

export function ProductPropertiesProvider({ children }: ProductPropertiesProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProductProperty, setSelectedProductProperty] = useState(null)
  const [selectedProductPropertyOption, setSelectedProductPropertyOption] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      priority: z.number().optional(),
      isMultiple: z.boolean().optional(),
      isRequired: z.boolean().optional(),
      showInTable: z.boolean().optional(),
      type: z.string().optional(),
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
      isMultiple: false,
      isRequired: false,
      showInTable: false,
      type: '',
      active: true,
    },
  })

  const optionsFormSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      priority: z.number().optional(),
      active: z.boolean().optional(),
      color: z.string().optional(),
    }), [t])

  const optionsForm = useForm({
    resolver: zodResolver(optionsFormSchema),
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

  const queryClient = useQueryClient()

  const useMutateCreateProductProperty = useCreateProductProperty({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProductProperty(null)
        queryClient.invalidateQueries({ queryKey: ['product-properties'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProductProperty(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditProductProperty = useEditProductProperty({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProductProperty(null)
        queryClient.invalidateQueries({ queryKey: ['product-properties'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProductProperty(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveProductProperty = useRemoveProductProperties({
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

  const useMutateCreateProductPropertyOption = useCreateProductPropertyOption({
    options: {
      onSuccess: ({ data }) => {
        setIsOptionsModalOpen(false)
        setIsLoading(false)
        setSelectedProductPropertyOption(null)
        queryClient.invalidateQueries({ queryKey: ['product-properties-options'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsOptionsModalOpen(false)
        setIsLoading(false)
        setSelectedProductPropertyOption(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditProductPropertyOption = useEditProductPropertyOption({
    options: {
      onSuccess: ({ data }) => {
        setIsOptionsModalOpen(false)
        setIsLoading(false)
        setSelectedProductPropertyOption(null)
        queryClient.invalidateQueries({ queryKey: ['product-properties-options', 'get'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsOptionsModalOpen(false)
        setIsLoading(false)
        setSelectedProductPropertyOption(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveProductPropertyOption = useRemoveProductPropertyOptions({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['product-properties-options'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const openModal = (productProperty) => {
    setIsModalOpen(true)
    let productPropertyValues = {}
    if (productProperty) {
      setSelectedProductProperty(productProperty)

      productPropertyValues = {
        names: { ...productProperty.names },
        priority: productProperty.priority,
        isRequired: productProperty.isRequired,
        showInTable: productProperty.showInTable,
        type: productProperty.type,
        active: productProperty.active,
      }
    }
    form.reset(productPropertyValues)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedProductProperty(null)
    form.reset()
  }

  const toggleModal = product => (isModalOpen ? closeModal() : openModal(product))

  const submitProductPropertyForm = (params) => {
    setIsLoading(true)
    if (!selectedProductProperty) {
      useMutateCreateProductProperty.mutate(params)
    }
    else {
      useMutateEditProductProperty.mutate({ ...params, id: selectedProductProperty.id })
    }
  }

  const removeProductProperty = (params) => {
    useMutateRemoveProductProperty.mutate(params)
  }

  const openOptionsModal = (params) => {
    setIsOptionsModalOpen(true)
    setSelectedProductPropertyOption(params.option)
    setSelectedProductProperty(params.property)

    let productPropertyOptionValues = {}
    if (params.option) {
      productPropertyOptionValues = params.option
    }
    optionsForm.reset(productPropertyOptionValues)
  }

  const closeOptionsModal = () => {
    setIsOptionsModalOpen(false)
    setSelectedProductPropertyOption(null)
    setSelectedProductProperty(null)
    optionsForm.reset()
  }

  const toggleOptionsModal = productPropertyOption => (isOptionsModalOpen ? closeOptionsModal() : openOptionsModal(productPropertyOption))

  const submitOptionsForm = (params) => {
    setIsLoading(true)
    if (!selectedProductPropertyOption) {
      useMutateCreateProductPropertyOption.mutate({ ...params, productProperty: selectedProductProperty.id })
    }
    else {
      useMutateEditProductPropertyOption.mutate({ ...params, id: selectedProductPropertyOption.id })
    }
  }

  const removeProductPropertyOption = (params) => {
    useMutateRemoveProductPropertyOption.mutate(params)
  }

  const value: ProductPropertiesContextType = useMemo(
    () => ({
      selectedProductProperty,
      isModalOpen,
      isLoading,
      form,
      isOptionsModalOpen,
      toggleModal,
      openModal,
      closeModal,
      submitProductPropertyForm,
      removeProductProperty,
      optionsForm,
      openOptionsModal,
      closeOptionsModal,
      submitOptionsForm,
      removeProductPropertyOption,
      toggleOptionsModal,
    }),
    [selectedProductProperty, isModalOpen, isLoading, openModal, closeModal, submitProductPropertyForm, removeProductProperty, isOptionsModalOpen, optionsForm, closeOptionsModal, submitOptionsForm, removeProductPropertyOption],
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
