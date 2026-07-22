import type { ReactNode } from 'react'
import type { Resolver } from 'react-hook-form'

import type { BarcodeFormValues } from '../components/form-context'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { toast } from 'sonner'
import { useBarcodeCreate, useBarcodeGenerate } from '@/api/hooks'
import { getBarcodeByCode } from '@/api/requests'
import {
  BarcodeFormProvider,
  createBarcodeFormSchema,
  getBarcodeFormValues,
} from '../components/form-context'

export function CreateBarcodeProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const formSchema = useMemo(() => createBarcodeFormSchema(t), [t])

  const form = useForm<BarcodeFormValues>({
    resolver: zodResolver(formSchema) as Resolver<BarcodeFormValues>,
    defaultValues: getBarcodeFormValues(),
  })

  const useMutateCreateBarcode = useBarcodeCreate({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['barcodes'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
        void navigate('/barcodes')
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
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitBarcodeForm = (params: BarcodeFormValues) => {
    useMutateCreateBarcode.mutate(params)
  }

  const getBarcode = async (code: string) => {
    const { data } = await getBarcodeByCode({ code })
    return data
  }

  const generateBarcode = async () => {
    return useMutateGenerateCode.mutateAsync().then(({ data }) => {
      form.setValue('code', data.data)
    })
  }

  const cancelForm = () => {
    void navigate('/barcodes')
  }

  const isLoading = useMutateCreateBarcode.isPending

  const value = useMemo(
    () => ({
      isLoading,
      form,
      submitBarcodeForm,
      generateBarcode,
      getBarcode,
      cancelForm,
    }),
    [isLoading, form],
  )

  return <BarcodeFormProvider value={value}>{children}</BarcodeFormProvider>
}
