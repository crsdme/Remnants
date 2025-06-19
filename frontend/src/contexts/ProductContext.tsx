import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  useCurrencyQuery,
  useProductBatch,
  useProductCreate,
  useProductDuplicate,
  useProductEdit,
  useProductExport,
  useProductImport,
  useProductPropertyGroupQuery,
  useProductRemove,
  useUnitQuery,
} from '@/api/hooks/'
import { getCategories, getUnits } from '@/api/requests'
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
  selectedWarehouse: string
  isEdit: boolean
  getPropertiesDefaultValues: (selectedGroup: string, productPropertiesGroups: ProductPropertyGroup[]) => Record<string, any>
  setSelectedWarehouse: (warehouse: string) => void
  setSelectedGroup: (group: string) => void
  setImages: (images: UploadedFile[]) => void
  openModal: (product?: Product) => void
  closeModal: () => void
  submitProductForm: (params) => void
  batchProduct: (params) => void
  removeProduct: (params: { ids: string[] }) => void
  importProducts: (params) => void
  duplicateProducts: (params: { ids: string[] }) => void
  exportProducts: (params: { ids: string[] }) => void
  loadCategoryOptions: (params: { query: string, selectedValue: string[] }) => Promise<Category[]>
  loadUnitsOptions: (params: { query: string, selectedValue: string[] }) => Promise<Unit[]>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

interface ProductProviderProps {
  children: ReactNode
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [images, setImages] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)

  const { t, i18n } = useTranslation()

  const requestProductPropertiesGroups = useProductPropertyGroupQuery({ pagination: { full: true }, filters: { active: [true], language: i18n.language } })
  const productPropertiesGroups = requestProductPropertiesGroups?.data?.data?.productPropertyGroups || []

  const requestCurrencies = useCurrencyQuery({ pagination: { full: true }, filters: { active: [true], language: i18n.language } })
  const currencies = requestCurrencies?.data?.data?.currencies || []

  const requestUnits = useUnitQuery({ pagination: { full: true }, filters: { active: [true], language: i18n.language } })
  const units = requestUnits?.data?.data?.units || []

  const productPropertiesSchema = getFormPropertiesSchema(selectedGroup, productPropertiesGroups, t)

  const formSchema = z.object({
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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: {},
      price: 0,
      currency: '',
      purchasePrice: 0,
      purchaseCurrency: '',
      categories: [],
      productProperties: {},
      productPropertiesGroup: '',
      unit: '',
      generateBarcode: false,
    },
  })

  const getProductFormValues = (product) => {
    if (product) {
      setSelectedGroup(product.productPropertiesGroup.id)
      setImages(product.images.map(image => ({
        ...image,
        id: image.id,
        file: image.path,
        preview: image.path,
        path: image.path,
        isNew: false,
      })))
      return {
        names: { ...product.names },
        categories: product.categories.map(category => category.id),
        price: product.price,
        currency: product.currency.id,
        purchasePrice: product.purchasePrice,
        purchaseCurrency: product.purchaseCurrency.id,
        productProperties: product.productProperties.reduce((acc, property) => ({ ...acc, [`${property.id}`]: property.value }), {}),
        productPropertiesGroup: product.productPropertiesGroup.id,
        unit: product.unit.id,
      }
    }
    else {
      setSelectedGroup(productPropertiesGroups[0]?.id)
      setImages([])
      return {
        names: {},
        price: 0,
        currency: currencies[0]?.id || '',
        purchasePrice: 0,
        purchaseCurrency: currencies[0]?.id || '',
        categories: [],
        productProperties: getPropertiesDefaultValues(productPropertiesGroups[0]?.id, productPropertiesGroups),
        productPropertiesGroup: productPropertiesGroups[0]?.id || '',
        unit: units[0]?.id || '',
        generateBarcode: false,
      }
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedProduct(null)
    setImages([])
    setSelectedGroup(null)
    form.reset({
      names: {},
      price: 0,
      currency: '',
      purchasePrice: 0,
      purchaseCurrency: '',
      categories: [],
      productProperties: {},
      productPropertiesGroup: '',
      unit: '',
      generateBarcode: false,
    })
  }

  const openModal = (product) => {
    setIsModalOpen(true)
    setIsEdit(!!product)
    setSelectedProduct(product)
    form.reset(getProductFormValues(product))
  }

  const queryClient = useQueryClient()

  const useMutateCreateProduct = useProductCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['products'] })
        queryClient.invalidateQueries({ queryKey: ['barcodes'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateDuplicateProduct = useProductDuplicate({
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

  const useMutateEditProduct = useProductEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['products'] })
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
        queryClient.invalidateQueries({ queryKey: ['products'] })
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
        queryClient.invalidateQueries({ queryKey: ['products'] })
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
        queryClient.invalidateQueries({ queryKey: ['products'] })
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

  const submitProductForm = (params) => {
    setIsLoading(true)
    if (params.productProperties) {
      params.productProperties = Object.entries(params.productProperties).map(([id, value]) => ({ id, value }))
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

    if (!selectedProduct)
      return useMutateCreateProduct.mutate(formData)

    formData.append('id', selectedProduct.id)
    return useMutateEditProduct.mutate(formData)
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

  const loadCategoryOptions = useCallback(async ({ query, selectedValue }) => {
    const response = await getCategories({
      pagination: { full: true },
      filters: {
        ...(selectedValue ? { ids: selectedValue } : { names: query }),
        active: [true],
        language: i18n.language,
      },
    })
    return response?.data?.categories || []
  }, [i18n.language])

  const loadUnitsOptions = useCallback(async ({ query, selectedValue }) => {
    const response = await getUnits({
      pagination: { full: true },
      filters: {
        ...(selectedValue ? { ids: selectedValue } : { names: query }),
        active: [true],
        language: i18n.language,
      },
    })
    return response?.data?.units || []
  }, [i18n.language])

  const value: ProductContextType = useMemo(
    () => ({
      selectedProduct,
      isModalOpen,
      isLoading,
      form,
      images,
      selectedGroup,
      selectedWarehouse,
      isEdit,
      getPropertiesDefaultValues,
      setImages,
      setSelectedGroup,
      setSelectedWarehouse,
      openModal,
      closeModal,
      submitProductForm,
      removeProduct,
      batchProduct,
      importProducts,
      duplicateProducts,
      exportProducts,
      loadCategoryOptions,
      loadUnitsOptions,
    }),
    [selectedProduct, isModalOpen, selectedWarehouse, isLoading, isEdit, form, images, selectedGroup],
  )

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

function getFormPropertiesSchema(selectedGroup, productPropertiesGroups, t) {
  const group = productPropertiesGroups.find(g => g.id === selectedGroup)

  const schema = group
    ? z.object(
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
                base = z.array(z.string()).min(1, { message: t('form.errors.required') })
                break
              case 'color':
                base = z.array(z.string()).min(1, { message: t('form.errors.required') })
                break
              case 'multiSelect':
                base = z.array(z.string()).min(1, { message: t('form.errors.required') })
                break
              default:
                base = z.any()
            }

            if (prop.isRequired) {
              if (base instanceof z.ZodString) {
                base = base.min(1, { message: t('form.errors.required') })
              }
              // else if (base instanceof z.ZodArray) {
              //   base = base.min(1, { message: t('form.errors.required') }).refine(value => value.length > 0, { message: t('form.errors.required') })
              // }
            }
            else {
              base = base.optional()
            }

            return [prop.id, base]
          }),
        ),
      )
    : z.record(z.string(), z.any()).optional()

  return schema
}

function getPropertiesDefaultValues(selectedGroup, productPropertiesGroups): Record<string, any> {
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
          defaultValue = []
          break
        case 'multiSelect':
          defaultValue = []
          break
        case 'color':
          defaultValue = []
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
