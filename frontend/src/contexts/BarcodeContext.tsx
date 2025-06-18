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
  useBarcodeCreate,
  useBarcodeEdit,
  useBarcodeGenerate,
  useBarcodeOptions,
  useBarcodeRemove,
} from '@/api/hooks'

interface BarcodeContextType {
  selectedBarcode: Barcode
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  selectedProducts: Product[]
  setSelectedProducts: (products: any) => void
  openModal: (barcode?: Barcode) => void
  closeModal: () => void
  submitBarcodeForm: (params) => void
  removeBarcodes: (params: { ids: string[] }) => void
  getBarcode: (code: string) => Promise<any>
  generateBarcode: () => void
}

const BarcodeContext = createContext<BarcodeContextType | undefined>(undefined)

interface BarcodeProviderProps {
  children: ReactNode
}

export function BarcodeProvider({ children }: BarcodeProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedBarcode, setSelectedBarcode] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      code: z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      active: true,
    },
  })

  const queryClient = useQueryClient()

  function getBarcodeFormValues(barcode) {
    if (!barcode) {
      setSelectedProducts([])
      return {
        code: '',
        active: true,
      }
    }
    const products = barcode.products.map((product: any) => ({
      ...product,
      selectedQuantity: product.quantity,
    }))
    setSelectedProducts(products)
    return {
      code: barcode.code,
      active: barcode.active,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedBarcode(null)
    form.reset()
  }

  const openModal = (barcode) => {
    setIsModalOpen(true)
    setIsEdit(!!barcode)
    setSelectedBarcode(barcode)
    form.reset(getBarcodeFormValues(barcode))
  }

  const useMutateCreateBarcode = useBarcodeCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['barcodes'] })
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

  const useMutateEditBarcode = useBarcodeEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['barcodes'] })
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

  const useMutateRemoveBarcode = useBarcodeRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['barcodes'] })
        queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  // const useMutateRequestBarcodes = useBarcodeQuery({
  //   options: {
  //     onSuccess: ({ data }) => {
  //       if (data.barcodes.length === 0) {
  //         toast.error(t(`error.title.${data.code}`), { description: `${t(`error.description.${data.code}`)} ${data.description || ''}` })
  //       }
  //       else {
  //         toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
  //       }
  //     },
  //     onError: ({ response }) => {
  //       const error = response.data.error
  //       toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
  //     },
  //   },
  // })
  const loadBarcodeOptions = useBarcodeOptions()

  const useMutateGenerateCode = useBarcodeGenerate({
    options: {
      onSuccess: ({ data }) => {
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeBarcodes = (params) => {
    useMutateRemoveBarcode.mutate(params)
  }

  const submitBarcodeForm = (params) => {
    setIsLoading(true)
    if (!selectedBarcode)
      return useMutateCreateBarcode.mutate(params)

    return useMutateEditBarcode.mutate({ ...params, id: selectedBarcode.id })
  }

  const getBarcode = (code: string) => loadBarcodeOptions({ query: code })

  const generateBarcode = () => {
    return useMutateGenerateCode.mutateAsync().then(({ data }) => {
      form.setValue('code', data.barcode)
    })
  }

  const value: BarcodeContextType = useMemo(
    () => ({
      selectedBarcode,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      selectedProducts,
      setSelectedProducts,
      openModal,
      closeModal,
      submitBarcodeForm,
      removeBarcodes,
      getBarcode,
      generateBarcode,
    }),
    [selectedBarcode, isModalOpen, isLoading, isEdit, form, selectedProducts],
  )

  return <BarcodeContext.Provider value={value}>{children}</BarcodeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBarcodeContext(): BarcodeContextType {
  const context = useContext(BarcodeContext)
  if (!context) {
    throw new Error('useBarcodeContext - BarcodeContext')
  }
  return context
}
