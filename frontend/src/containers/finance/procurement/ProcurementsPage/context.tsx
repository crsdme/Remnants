import type { ReactNode } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  useProcurementRemove,
} from '@/api/hooks'

interface ProcurementContextType {
  removeProcurement: (params: { ids: string[] }) => void
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined)

export function ProcurementProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  // const loadProcurementItemsOptions = useProcurementItemsOptions()

  // const editModal = async (procurement) => {
  //   setIsLoading(true)
  //   setIsModalOpen(true)
  //   setIsEdit(true)
  //   setSelectedProcurement(procurement)
  //   const items = await loadProcurementItemsOptions({ selectedValue: procurement?.id ? [procurement.id] : [] })
  //   const values = {
  //     comment: procurement.comment,
  //     supplier: procurement.supplier,
  //     items: items.map((item: any) => ({
  //       id: item.id,
  //       quantity: item.quantity,
  //       purchasePrice: item.purchasePrice,
  //       purchaseCurrency: item.purchaseCurrency,
  //     })),
  //   }
  //   form.reset(values)
  //   setIsLoading(false)
  // }

  // const useMutateCreateProcurement = useProcurementCreate({
  //   options: {
  //     onSuccess: ({ data }) => {
  //       closeModal()
  //       queryClient.invalidateQueries({ queryKey: ['procurements'] })
  //       queryClient.invalidateQueries({ queryKey: ['products'] })
  //       toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
  //     },
  //     onError: ({ response }) => {
  //       const error = response.data.error
  //       closeModal()
  //       toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
  //     },
  //   },
  // })

  // const useMutateEditProcurement = useProcurementEdit({
  //   options: {
  //     onSuccess: ({ data }) => {
  //       closeModal()
  //       queryClient.invalidateQueries({ queryKey: ['procurements'] })
  //       queryClient.invalidateQueries({ queryKey: ['products'] })
  //       toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
  //     },
  //     onError: ({ response }) => {
  //       const error = response.data.error
  //       closeModal()
  //       toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
  //     },
  //   },
  // })

  const useMutateRemoveProcurement = useProcurementRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['procurements'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message ?? ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  // const loadProcurementScanOptions = useProcurementScanOptions()

  // const getBarcode = async (code: string) => {
  //   const { procurementItems } = await loadProcurementScanOptions({ barcode: code })
  //   return procurementItems
  // }

  const removeProcurement = (params: { ids: string[] }) => {
    useMutateRemoveProcurement.mutate(params)
  }

  // const submitProcurementForm = (params) => {
  //   setIsLoading(true)

  //   if (isEdit) {
  //     return useMutateEditProcurement.mutate({
  //       id: selectedProcurement.id,
  //       comment: params.comment,
  //       supplier: params.supplier,
  //       status: params.status,
  //       warehouse: params.warehouse,
  //       expenses: params.expenses,
  //       payments: params.payments,
  //       items: params.items,
  //     })
  //   }

  //   return useMutateCreateProcurement.mutate({
  //     createdBy: params.createdBy,
  //     comment: params.comment,
  //     items: params.items,
  //     supplier: params.supplier,
  //     status: params.status,
  //     warehouse: params.warehouse,
  //     expenses: params.expenses,
  //     payments: params.payments,
  //   })
  // }

  // const onError = (formErrors) => {
  //   if (formErrors.products) {
  //     toast.error(formErrors.products.message)
  //   }
  // }

  const value: ProcurementContextType = useMemo(
    () => ({
      removeProcurement,
    }),
    [],
  )

  return <ProcurementContext.Provider value={value}>{children}</ProcurementContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProcurementContext(): ProcurementContextType {
  const context = useContext(ProcurementContext)
  if (!context) {
    throw new Error('useProcurementContext - ProcurementContext')
  }
  return context
}
