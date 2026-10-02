import type { ReactNode } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useProcurementConfirm, useProcurementRemove, useProcurementUnconfirm } from '@/api/hooks'

interface ProcurementContextType {
  removeProcurement: (params: { ids: string[] }) => void
  confirmProcurement: (params: { id: string, warehouseId?: string }) => void
  unconfirmProcurement: (params: { id: string }) => void
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined)

export function ProcurementProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const { mutate: mutateRemoveProcurement } = useProcurementRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['procurements'] })
        void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message ?? ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const { mutate: mutateConfirmProcurement } = useProcurementConfirm({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['procurements'] })
        void queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message ?? ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const { mutate: mutateUnconfirmProcurement } = useProcurementUnconfirm({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['procurements'] })
        void queryClient.invalidateQueries({ queryKey: ['warehouse-transactions'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message ?? ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const confirmProcurement = useCallback((params: { id: string, warehouseId?: string }) => {
    mutateConfirmProcurement(params)
  }, [mutateConfirmProcurement])

  const unconfirmProcurement = useCallback((params: { id: string }) => {
    mutateUnconfirmProcurement(params)
  }, [mutateUnconfirmProcurement])

  const removeProcurement = useCallback((params: { ids: string[] }) => {
    mutateRemoveProcurement(params)
  }, [mutateRemoveProcurement])

  const value: ProcurementContextType = useMemo(
    () => ({
      removeProcurement,
      confirmProcurement,
      unconfirmProcurement,
    }),
    [removeProcurement, confirmProcurement, unconfirmProcurement],
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
