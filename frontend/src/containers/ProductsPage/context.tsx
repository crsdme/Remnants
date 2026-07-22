import type { ProductPopulatedDTO, ProductPropertyGroupPopulatedDTO } from '@remnant/shared'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import type { UseListQueryStateReturn } from '@/utils/hooks'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'

import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  useCurrencyQuery,
  useProductBatch,
  useProductCreate,
  useProductDownloadTemplate,
  useProductEdit,
  useProductExport,
  useProductImport,
  useProductPropertyGroupQuery,
  useProductRemove,
  useUnitQuery,
} from '@/api/hooks/'
import { downloadBlob } from '@/utils/helpers/download'
import { useListQueryState, useLocale } from '@/utils/hooks'

export interface UploadedFile {
  id: string
  filename?: string
  file: File | string
  preview: string
  name: string
  type: string
  path: string
  isNew: boolean
}

interface ProductContextType {
  selectedProduct: ProductPopulatedDTO | null
  isModalOpen: boolean
  isLogsModalOpen: boolean
  isLoading: boolean
  form: UseFormReturn<ProductFormValues>
  images: UploadedFile[]
  selectedGroup: string | null
  selectedProductLogs: { type: 'quantity' | 'audit', id: string } | null
  isEdit: boolean
  listQueryState: UseListQueryStateReturn<{ search: string, selectedWarehouse: string }>
  getPropertiesDefaultValues: (selectedGroup: string, productPropertiesGroups: ProductPropertyGroupPopulatedDTO[]) => Record<string, any>
  setSelectedGroup: (group: string) => void
  setImages: Dispatch<SetStateAction<UploadedFile[]>>
  openModal: (product?: ProductPopulatedDTO) => void
  closeModal: () => void
  openLogsModal: (type: 'quantity' | 'audit', id: string) => void
  closeLogsModal: () => void
  submitProductForm: (params: ProductFormValues) => void
  batchProduct: (params: any) => void
  removeProduct: (params: { ids: string[] }) => void
  importProducts: (params: { file: File }) => void
  exportProducts: (params: { ids: string[] }) => void
  downloadTemplate: () => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export interface ProductFormValues {
  id?: string
  images: UploadedFile[]
  names: Record<string, string>
  categories: string[]
  price: number
  currency: string
  purchasePrice: number
  purchaseCurrency: string
  productPropertiesGroup: string
  unit: string
  generateBarcode: boolean
  isAutoSyncEnabled: boolean
  syncSites: string[]
  productProperties: Record<string, any>
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)
  const [selectedProductLogs, setSelectedProductLogs] = useState<{ type: 'quantity' | 'audit', id: string } | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductPopulatedDTO | null>(null)
  const [images, setImages] = useState<UploadedFile[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const listQueryState = useListQueryState({
    readFilters: params => ({
      search: params.get('search'),
      selectedWarehouse: params.get('selectedWarehouse'),
    }),
    writeFilters: (params, filters) => {
      params.set('search', filters.search || '')
      params.set('selectedWarehouse', filters.selectedWarehouse || '')
    },
  })

  const { t, language } = useLocale()

  const { productPropertyGroups } = useProductPropertyGroupQuery({ pagination: { full: true }, filters: { active: [true], language } })

  const { currencies } = useCurrencyQuery({ pagination: { full: true }, filters: { active: [true], language } })

  const { units } = useUnitQuery({ pagination: { full: true }, filters: { active: [true], language } })

  const productPropertiesSchema = getFormPropertiesSchema(selectedGroup || '', productPropertyGroups, t)

  const formSchema = useMemo(
    () => createProductFormSchema(t, productPropertiesSchema),
    [t, productPropertiesSchema],
  )

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<ProductFormValues>,
    defaultValues: getProductFormDefaults(undefined, { currencies, units, productPropertyGroups }),
  })

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedProduct(null)
    setImages([])
    setSelectedGroup(null)
    form.reset(getProductFormDefaults(undefined, { currencies, units, productPropertyGroups }))
  }

  const openModal = (product?: ProductPopulatedDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!product)
    setSelectedProduct(product ?? null)

    if (product) {
      setSelectedGroup(product.productPropertiesGroup.id)
      setImages(product.images.map(image => ({
        id: image.id,
        filename: image.filename,
        file: image.path,
        preview: image.path,
        name: image.name,
        type: image.type,
        path: image.path,
        isNew: false,
      })))
    }
    else {
      setSelectedGroup(productPropertyGroups[0]?.id)
      setImages([])
    }
    form.reset(getProductFormDefaults(product, { currencies, units, productPropertyGroups }))
  }

  const openLogsModal = (type: 'quantity' | 'audit', id: string) => {
    setIsLogsModalOpen(true)
    setSelectedProductLogs({ type, id })
  }

  const closeLogsModal = () => {
    setIsLogsModalOpen(false)
    setSelectedProductLogs(null)
  }

  const queryClient = useQueryClient()

  const useMutateCreateProduct = useProductCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        void queryClient.invalidateQueries({ queryKey: ['barcodes'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditProduct = useProductEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveProduct = useProductRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateImportProduct = useProductImport({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateBatchProduct = useProductBatch({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateExportProduct = useProductExport({
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

  const useMutateDownloadTemplate = useProductDownloadTemplate({
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

  const submitProductForm = (params: ProductFormValues) => {
    const productParams = {
      ...params,
      images: (params.images || []).map((image: any) => ({
        id: image.id,
        filename: image.filename,
        name: image.name,
        type: image.type,
        path: image.path,
        isNew: image.isNew,
      })),
      uploadedImages: (params.images || []).filter(
        (image): image is UploadedFile & { file: File } => typeof image.file !== 'string',
      ),
    }

    if (params.productProperties) {
      productParams.productProperties = Object.entries(params.productProperties).map(([id, value]) => ({ id, value }))
    }

    const formData = new FormData()

    for (const [key, value] of Object.entries(productParams)) {
      if (key !== 'uploadedImages') {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value as string)
      }
    }

    productParams.uploadedImages.forEach((img) => {
      formData.append('uploadedImages', img.file, img.name)
      formData.append('uploadedImagesIds', img.id)
    })

    if (!selectedProduct)
      return useMutateCreateProduct.mutate(formData as unknown as any)

    formData.append('id', selectedProduct.id)
    return useMutateEditProduct.mutate(formData as unknown as any)
  }

  const removeProduct = (params: { ids: string[] }) => {
    useMutateRemoveProduct.mutate(params)
  }

  const batchProduct = (params: any) => {
    useMutateBatchProduct.mutate(params)
  }

  const importProducts = (params: { file: File }) => {
    useMutateImportProduct.mutate(params)
  }

  const exportProducts = (params: { ids: string[] }) => {
    useMutateExportProduct.mutate(params)
  }

  const downloadTemplate = () => {
    useMutateDownloadTemplate.mutate()
  }

  const isLoading = false

  const value: ProductContextType = useMemo(
    () => ({
      selectedProduct,
      isModalOpen,
      isLogsModalOpen,
      isLoading,
      form,
      images,
      selectedGroup,
      selectedProductLogs,
      isEdit,
      listQueryState,
      getPropertiesDefaultValues,
      setImages,
      setSelectedGroup,
      openModal,
      closeModal,
      openLogsModal,
      closeLogsModal,
      submitProductForm,
      removeProduct,
      batchProduct,
      importProducts,
      exportProducts,
      downloadTemplate,
    }),
    [
      selectedProduct,
      selectedGroup,
      selectedProductLogs,
      isEdit,
      form,
      images,
      isLoading,
      isModalOpen,
      isLogsModalOpen,
      getPropertiesDefaultValues,
      setImages,
      setSelectedGroup,
      openModal,
      closeModal,
      openLogsModal,
      closeLogsModal,
      submitProductForm,
      removeProduct,
      batchProduct,
      importProducts,
      exportProducts,
      downloadTemplate,
    ],
  )

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

function createProductFormSchema(
  t: (key: string, options?: Record<string, unknown>) => string,
  productPropertiesSchema: z.ZodTypeAny,
) {
  return z.object({
    names: z.record(
      z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
    ),
    categories: z.array(z.string()).min(1, { message: t('form.errors.required') }),
    price: z.number().min(1, { message: t('form.errors.required') }),
    currency: z.string().min(1, { message: t('form.errors.required') }),
    purchasePrice: z.number().optional(),
    purchaseCurrency: z.string().optional(),
    productPropertiesGroup: z.string().optional(),
    unit: z.string().min(1, { message: t('form.errors.required') }),
    productProperties: productPropertiesSchema,
    generateBarcode: z.boolean().optional(),
    isAutoSyncEnabled: z.boolean().optional(),
    syncSites: z.array(z.string()).optional(),
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
  })
}

interface ProductFormDefaultsDeps {
  currencies: Array<{ id: string }>
  units: Array<{ id: string }>
  productPropertyGroups: ProductPropertyGroupPopulatedDTO[]
}

function getProductFormDefaults(
  product: ProductPopulatedDTO | undefined,
  { currencies, units, productPropertyGroups }: ProductFormDefaultsDeps,
): ProductFormValues {
  if (product) {
    return {
      names: { ...product.names },
      categories: product.categories.map((category: { id: string }) => category.id),
      price: product.price,
      currency: product.currency.id,
      purchasePrice: product.purchasePrice || 0,
      purchaseCurrency: product.purchaseCurrency?.id || '',
      productProperties: product.productProperties.reduce(
        (acc, property) => ({ ...acc, [`${property.id}`]: property.value }),
        {} as Record<string, unknown>,
      ),
      productPropertiesGroup: product.productPropertiesGroup.id,
      images: product.images.map(image => ({
        id: image.id,
        filename: image.filename,
        file: image.path,
        preview: image.path,
        name: image.name,
        type: image.type,
        path: image.path,
        isNew: false,
      })),
      unit: product.unit.id,
      generateBarcode: false,
      isAutoSyncEnabled: true,
      syncSites: [],
    }
  }
  return {
    names: {},
    images: [],
    price: 0,
    currency: currencies[0]?.id || '',
    purchasePrice: 0,
    purchaseCurrency: currencies[0]?.id || '',
    categories: [],
    productProperties: getPropertiesDefaultValues(productPropertyGroups[0]?.id, productPropertyGroups),
    productPropertiesGroup: productPropertyGroups[0]?.id || '',
    unit: units[0]?.id || '',
    generateBarcode: false,
    isAutoSyncEnabled: true,
    syncSites: [],
  }
}

function getFormPropertiesSchema(selectedGroup: string, productPropertiesGroups: ProductPropertyGroupPopulatedDTO[], t: (key: string, options?: Record<string, unknown>) => string) {
  const group = productPropertiesGroups.find(g => g.id === selectedGroup)
  let schema: z.ZodTypeAny = z.record(z.string(), z.any()).optional()

  if (group) {
    schema = z.object(
      Object.fromEntries(
        group.productProperties.map((prop) => {
          let base: z.ZodTypeAny

          switch (prop.type) {
            case 'text':
              base = z.string({ required_error: t('form.errors.required') })
              break
            case 'number':
              base = z.number({ required_error: t('form.errors.required') })
              break
            case 'boolean':
              base = z.boolean({ required_error: t('form.errors.required') })
              break
            case 'select':
              base = z.string({ required_error: t('form.errors.required') })
              break
            case 'color':
              base = z.string({ required_error: t('form.errors.required') })
              break
            case 'multiSelect':
              base = z.array(z.string())
              break
            default:
              base = z.any()
          }

          if (prop.isRequired) {
            if (base instanceof z.ZodString) {
              base = base.min(1, { message: t('form.errors.required') })
            }
          }
          else {
            base = base.optional()
          }

          return [prop.id, base]
        }),
      ),
    )
  }

  return schema
}

function getPropertiesDefaultValues(selectedGroup: string, productPropertiesGroups: ProductPropertyGroupPopulatedDTO[]): Record<string, any> {
  const group = productPropertiesGroups.find(g => g.id === selectedGroup)

  if (!group)
    return {}

  return Object.fromEntries(
    group.productProperties.map((prop) => {
      let defaultValue: any

      switch (prop.type) {
        case 'text':
          defaultValue = ''
          break
        case 'select':
          defaultValue = ''
          break
        case 'multiSelect':
          defaultValue = []
          break
        case 'color':
          defaultValue = ''
          break
        case 'number':
          defaultValue = 0
          break
        case 'boolean':
          defaultValue = false
          break
        default:
          defaultValue = undefined
      }

      return [prop.id, defaultValue]
    }),
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductContext(): ProductContextType {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProductContext - ProductContext')
  }
  return context
}
