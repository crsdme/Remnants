import type { BarcodeDTO, GetBarcodeByCodeResponse } from '@remnant/shared'
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
  useBarcodeCreate,
  useBarcodeEdit,
  useBarcodeGenerate,
  useBarcodeRemove,
} from '@/api/hooks'
import { getBarcodeByCode } from '@/api/requests'

interface BarcodeContextType {
  selectedBarcode: BarcodeDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<BarcodeFormValues>
  openModal: (barcode?: BarcodeDTO | undefined) => void
  closeModal: () => void
  submitBarcodeForm: (params: BarcodeFormValues) => void
  removeBarcodes: (params: { ids: string[] }) => void
  getBarcode: (code: string) => Promise<GetBarcodeByCodeResponse>
  generateBarcode: () => Promise<void>
}

const BarcodeContext = createContext<BarcodeContextType | undefined>(undefined)

interface BarcodeFormValues {
  code: string
  active: boolean
  products: {
    id: string
    lineQuantity: number
  }[]
}

function getBarcodeFormValues(barcode?: BarcodeDTO): BarcodeFormValues {
  if (!barcode) {
    return {
      code: '',
      active: true,
      products: [],
    }
  }
  const products = barcode.products.map(product => ({
    ...product,
    lineQuantity: product.unitsPerScan,
  }))

  return {
    code: barcode.code,
    active: barcode.active,
    products,
  }
}

export function BarcodeProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedBarcode, setSelectedBarcode] = useState<BarcodeDTO | undefined>(undefined)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      code: z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
      active: z.boolean().default(true),
      products: z.array(z.object({
        id: z.string({
          required_error: t('form.errors.required'),
        }),
        lineQuantity: z.number({
          required_error: t('form.errors.required'),
        }),
      })).min(1, { message: t('form.errors.required.products') }),
    }), [t])

  const form = useForm<BarcodeFormValues>({
    resolver: zodResolver(formSchema) as Resolver<BarcodeFormValues>,
    defaultValues: getBarcodeFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedBarcode(undefined)
    form.reset()
  }

  const openModal = (barcode: BarcodeDTO | undefined) => {
    setIsModalOpen(true)
    setIsEdit(!!barcode)
    setSelectedBarcode(barcode)
    form.reset(getBarcodeFormValues(barcode))
  }

  const useMutateCreateBarcode = useBarcodeCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['barcodes'] })
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

  const useMutateEditBarcode = useBarcodeEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['barcodes'] })
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

  const useMutateRemoveBarcode = useBarcodeRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['barcodes'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.message || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

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

  const removeBarcodes = (params: { ids: string[] }) => {
    useMutateRemoveBarcode.mutate(params)
  }

  const submitBarcodeForm = (params: BarcodeFormValues) => {
    if (!selectedBarcode)
      return useMutateCreateBarcode.mutate(params)

    return useMutateEditBarcode.mutate({ ...params, id: selectedBarcode.id })
  }

  const getBarcode = async (code: string) => {
    const { data } = await getBarcodeByCode({ code })
    return data
  }

  const generateBarcode = async () => {
    return useMutateGenerateCode.mutateAsync().then(({ data }) => {
      form.setValue('code', data.barcode)
    })
  }

  const isLoading = useMutateCreateBarcode.isPending || useMutateEditBarcode.isPending || useMutateRemoveBarcode.isPending

  const value: BarcodeContextType = useMemo(
    () => ({
      selectedBarcode,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitBarcodeForm,
      removeBarcodes,
      getBarcode,
      generateBarcode,
    }),
    [selectedBarcode, isModalOpen, isLoading, isEdit, form],
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
