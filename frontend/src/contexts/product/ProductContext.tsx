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
  useBatchProduct,
  useCreateProduct,
  useDuplicateProduct,
  useEditProduct,
  useExportProduct,
  useImportProduct,
  useRemoveProduct,
} from '@/api/hooks/'
import { downloadBlob } from '@/utils/helpers/download'

interface UploadedFile {
  id: string
  file: File
  preview: string
  name: string
  type: string
}

interface ProductContextType {
  selectedProduct: Product
  isModalOpen: boolean
  isLoading: boolean
  form: UseFormReturn
  images: UploadedFile[]
  selectedGroup: string
  setSelectedGroup: (group: string) => void
  setImages: (images: UploadedFile[]) => void
  toggleModal: (product?: Product) => void
  openModal: (product?: Product) => void
  closeModal: () => void
  submitProductForm: (params) => void
  batchProduct: (params) => void
  removeProduct: (params: { ids: string[] }) => void
  importProducts: (params) => void
  duplicateProducts: (params: { ids: string[] }) => void
  exportProducts: (params: { ids: string[] }) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

interface ProductProviderProps {
  children: ReactNode
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [images, setImages] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      categories: z.array(z.string()),
      price: z.number(),
      currency: z.string(),
      purchasePrice: z.number().optional(),
      purchaseCurrency: z.string().optional(),
      productProperties: z.any().optional(),
      productPropertiesGroup: z.string().optional(),
      unit: z.array(z.string()),
    }).superRefine((data, ctx) => {
      if (
        data.purchasePrice !== undefined
        && data.purchasePrice !== null
        && data.purchaseCurrency === undefined
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('form.errors.required'),
          path: ['purchaseCurrency'],
        })
      }
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: {
        en: '',
        ru: '',
      },
      price: 0,
      currency: '',
      purchasePrice: 0,
      purchaseCurrency: '',
      categories: [],
      productProperties: [],
      // images: [],
      unit: [],
    },
  })

  const queryClient = useQueryClient()

  const useMutateCreateProduct = useCreateProduct({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProduct(null)
        setSelectedGroup(null)
        setImages([])
        queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProduct(null)
        setSelectedGroup(null)
        setImages([])
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateDuplicateProduct = useDuplicateProduct({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditProduct = useEditProduct({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProduct(null)
        setSelectedGroup(null)
        setImages([])
        queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedProduct(null)
        setSelectedGroup(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveProduct = useRemoveProduct({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateImportProduct = useImportProduct({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateBatchProduct = useBatchProduct({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateExportProduct = useExportProduct({
    options: {
      onSuccess: ({ data, headers }) => {
        downloadBlob(data, 'products-template.xlsx')
        toast.success(t(`response.title.${headers['x-export-code']}`), { description: `${t(`response.description.${headers['x-export-code']}`)} ${headers['x-export-message'] || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const openModal = (product) => {
    setIsModalOpen(true)
    let productValues = {}
    if (product) {
      setSelectedProduct(product)
      setSelectedGroup(product.productPropertiesGroup.id)
      setImages(product.images.map(image => ({
        ...image,
        id: image.id,
        file: image.path,
        preview: image.path,
        path: image.path,
        isNew: false,
      })))
      productValues = {
        names: { ...product.names },
        categories: product.categories.map(category => category.id),
        price: product.price,
        currency: product.currency.id,
        purchasePrice: product.purchasePrice,
        purchaseCurrency: product.purchaseCurrency.id,
        productProperties: product.productProperties.reduce((acc, property) => ({ ...acc, [`${property.id}`]: property.value }), {}),
        productPropertiesGroup: product.productPropertiesGroup.id,
        unit: [product.unit.id],
      }
    }
    form.reset(productValues)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedProduct(null)
    setSelectedGroup(null)
    setImages([])
    form.reset()
  }

  const toggleModal = product => (isModalOpen ? closeModal() : openModal(product))

  const submitProductForm = (params) => {
    setIsLoading(true)

    if (params.productProperties) {
      params.productProperties = Object.entries(params.productProperties).map(([id, value]) => ({ id, value }))
    }

    if (params.unit) {
      params.unit = params.unit[0]
    }

    params.images = images.map(image => ({
      id: image.id,
      filename: image.filename,
      name: image.name,
      type: image.type,
      path: image.path,
      isNew: image.isNew,
    }))

    params.uploadedImages = images.filter(image => typeof image.file !== 'string')

    const formData = new FormData()

    for (const [key, value] of Object.entries(params)) {
      if (key !== 'uploadedImages') {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value as string)
      }
    }

    params.uploadedImages.forEach((img) => {
      formData.append('uploadedImages', img.file, img.name)
      formData.append('uploadedImagesIds', img.id)
    })

    if (!selectedProduct) {
      useMutateCreateProduct.mutate(formData)
    }
    else {
      formData.append('id', selectedProduct.id)
      useMutateEditProduct.mutate(formData)
    }
  }

  const removeProduct = (params) => {
    useMutateRemoveProduct.mutate(params)
  }

  const batchProduct = (params) => {
    useMutateBatchProduct.mutate(params)
  }

  const importProducts = (params) => {
    useMutateImportProduct.mutate(params)
  }

  const duplicateProducts = (params) => {
    useMutateDuplicateProduct.mutate(params)
  }

  const exportProducts = (params) => {
    useMutateExportProduct.mutate(params)
  }

  const value: ProductContextType = useMemo(
    () => ({
      selectedProduct,
      isModalOpen,
      isLoading,
      form,
      images,
      selectedGroup,
      setImages,
      setSelectedGroup,
      toggleModal,
      openModal,
      closeModal,
      submitProductForm,
      removeProduct,
      batchProduct,
      importProducts,
      duplicateProducts,
      exportProducts,
    }),
    [selectedProduct, isModalOpen, isLoading, openModal, closeModal, submitProductForm, removeProduct, batchProduct, importProducts, duplicateProducts, exportProducts],
  )

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductContext(): ProductContextType {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProductContext - ProductContext')
  }
  return context
}
